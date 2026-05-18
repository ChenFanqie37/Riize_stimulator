import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return

  const text = readFileSync(filePath, 'utf8')
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue

    const key = line.slice(0, line.indexOf('=')).trim()
    const value = line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')
    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadDotEnv(path.join(rootDir, '.env'))

const port = Number(process.env.PORT || process.env.PROXY_PORT || 8787)
const apiKeyFile = path.resolve(rootDir, process.env.API_KEY_FILE || 'apikey.txt')
const apiBaseUrl = (process.env.API_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '')
const apiModel = process.env.API_MODEL || 'deepseek-chat'
const allowClientModel = process.env.ALLOW_CLIENT_MODEL === 'true'
const accessToken = process.env.PROXY_ACCESS_TOKEN || ''
const maxRequestBytes = Number(process.env.MAX_PROXY_BODY_BYTES || 512 * 1024)
const maxCompletionTokens = Number(process.env.MAX_COMPLETION_TOKENS || 2048)
const upstreamTimeoutMs = Number(process.env.UPSTREAM_TIMEOUT_MS || 45_000)
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000)
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 40)

const retryStatuses = new Set([401, 403, 408, 409, 429, 500, 502, 503, 504])
const buckets = new Map()

let keyIndex = 0
let cachedKeys = []
let cachedKeyMtime = -1

function parseApiKeys(text) {
  const keys = []
  const seen = new Set()
  const tokenPattern = /(?:sk-[A-Za-z0-9._-]{16,}|[A-Za-z0-9._-]{32,})/g

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const value = line.includes('=') ? line.slice(line.indexOf('=') + 1).trim() : line
    const matches = value.match(tokenPattern) || []

    for (const match of matches) {
      const key = match.replace(/^["']|["']$/g, '')
      if (!seen.has(key)) {
        seen.add(key)
        keys.push(key)
      }
    }
  }

  return keys
}

async function loadApiKeys() {
  const fileStat = await stat(apiKeyFile)
  if (fileStat.mtimeMs === cachedKeyMtime && cachedKeys.length > 0) {
    return cachedKeys
  }

  const text = await readFile(apiKeyFile, 'utf8')
  const keys = parseApiKeys(text)
  cachedKeys = keys
  cachedKeyMtime = fileStat.mtimeMs
  return keys
}

function getNextKey(keys) {
  const key = keys[keyIndex % keys.length]
  keyIndex += 1
  return key
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(data))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > maxRequestBytes) {
        reject(Object.assign(new Error('Request body too large'), { statusCode: 413 }))
        req.destroy()
      }
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for']
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim()
  }
  return req.socket.remoteAddress || 'unknown'
}

function isRateLimited(req) {
  const ip = getClientIp(req)
  const now = Date.now()
  const bucket = buckets.get(ip)

  if (!bucket || now - bucket.startedAt > rateLimitWindowMs) {
    buckets.set(ip, { startedAt: now, count: 1 })
    return false
  }

  bucket.count += 1
  return bucket.count > rateLimitMax
}

function applyCors(req, res) {
  const origin = req.headers.origin
  const configuredOrigin = process.env.CORS_ORIGIN || ''
  const localOrigin = origin && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin)
  const allowedOrigin = configuredOrigin === '*' ? '*' : configuredOrigin || (localOrigin ? origin : '')

  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Proxy-Access-Token')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  }
}

function isAuthorized(req) {
  if (!accessToken) return true
  const headerToken = req.headers['x-proxy-access-token']
  return typeof headerToken === 'string' && headerToken === accessToken
}

function normalizeProxyPayload(input) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.messages)) {
    const error = new Error('Invalid chat request: messages array is required')
    error.statusCode = 400
    throw error
  }

  const requestedTokens = Number(input.max_tokens || maxCompletionTokens)
  return {
    ...input,
    model: allowClientModel ? input.model || apiModel : apiModel,
    max_tokens: Math.min(Math.max(1, requestedTokens), maxCompletionTokens),
  }
}

async function handleHealth(_req, res) {
  try {
    const keys = await loadApiKeys()
    sendJson(res, 200, {
      ok: keys.length > 0,
      keyCount: keys.length,
      authRequired: Boolean(accessToken),
      model: apiModel,
      baseUrl: apiBaseUrl,
    })
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: 'Unable to read API key file',
      detail: error.message,
      authRequired: Boolean(accessToken),
    })
  }
}

async function handleChat(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, { error: 'Proxy access token is missing or invalid' })
    return
  }

  if (isRateLimited(req)) {
    sendJson(res, 429, { error: 'Too many requests. Please wait a moment and try again.' })
    return
  }

  let body
  try {
    body = JSON.parse(await readBody(req))
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message || 'Invalid JSON body' })
    return
  }

  let payload
  try {
    payload = normalizeProxyPayload(body)
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message })
    return
  }

  let keys
  try {
    keys = await loadApiKeys()
  } catch (error) {
    sendJson(res, 500, { error: 'Unable to read API key file', detail: error.message })
    return
  }

  if (keys.length === 0) {
    sendJson(res, 500, { error: 'No usable API keys found in apikey.txt' })
    return
  }

  const maxAttempts = Math.min(keys.length, Number(process.env.MAX_UPSTREAM_ATTEMPTS || keys.length))
  let lastStatus = 502
  let lastText = ''

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), upstreamTimeoutMs)

    try {
      const upstream = await fetch(`${apiBaseUrl}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getNextKey(keys)}`,
        },
        body: JSON.stringify(payload),
      })

      const text = await upstream.text()
      lastStatus = upstream.status
      lastText = text

      if (upstream.ok) {
        res.writeHead(upstream.status, {
          'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        })
        res.end(text)
        return
      }

      if (!retryStatuses.has(upstream.status) || attempt === maxAttempts - 1) {
        sendJson(res, upstream.status, {
          error: 'Upstream API error',
          status: upstream.status,
          detail: text.slice(0, 500),
        })
        return
      }
    } catch (error) {
      lastStatus = error.name === 'AbortError' ? 504 : 502
      lastText = error.message
      if (attempt === maxAttempts - 1) break
    } finally {
      clearTimeout(timeout)
    }

    await sleep(300 * (attempt + 1))
  }

  sendJson(res, lastStatus, {
    error: 'All upstream attempts failed',
    status: lastStatus,
    detail: String(lastText).slice(0, 500),
  })
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

async function serveStatic(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  if (!existsSync(distDir)) {
    sendJson(res, 404, {
      error: 'Frontend build not found',
      detail: 'Run npm run build before npm run start, or use npm run dev for development.',
    })
    return
  }

  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  let pathname = decodeURIComponent(requestUrl.pathname)
  const buildBase = '/Riize_stimulator/'
  if (pathname.startsWith(buildBase)) {
    pathname = `/${pathname.slice(buildBase.length)}`
  }
  if (pathname === '/') pathname = '/index.html'

  let filePath = path.normalize(path.join(distDir, pathname))
  if (!filePath.startsWith(distDir)) {
    sendJson(res, 403, { error: 'Forbidden' })
    return
  }

  try {
    const fileStat = await stat(filePath)
    if (fileStat.isDirectory()) filePath = path.join(filePath, 'index.html')
  } catch {
    filePath = path.join(distDir, 'index.html')
  }

  try {
    const data = await readFile(filePath)
    const ext = path.extname(filePath)
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': path.basename(filePath) === 'index.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    })
    if (req.method === 'HEAD') {
      res.end()
    } else {
      res.end(data)
    }
  } catch {
    sendJson(res, 404, { error: 'Not found' })
  }
}

const server = createServer(async (req, res) => {
  applyCors(req, res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  if (requestUrl.pathname === '/api/health') {
    await handleHealth(req, res)
    return
  }

  if (requestUrl.pathname === '/api/chat/completions') {
    await handleChat(req, res)
    return
  }

  if (requestUrl.pathname.startsWith('/api/')) {
    sendJson(res, 404, { error: 'API route not found' })
    return
  }

  await serveStatic(req, res)
})

server.listen(port, () => {
  console.log(`[proxy] listening on http://localhost:${port}`)
  console.log(`[proxy] reading API keys from ${apiKeyFile}`)
  console.log(`[proxy] upstream ${apiBaseUrl}, model ${apiModel}`)
})
