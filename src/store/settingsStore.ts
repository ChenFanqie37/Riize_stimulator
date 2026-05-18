import { create } from 'zustand'

interface SettingsState {
  showTranslation: boolean
  language: 'zh' | 'ko'
  fontSize: 'small' | 'medium' | 'large'
  apiProxyUrl: string
  proxyAccessToken: string
  apiModel: string
  hasApiKey: () => boolean
  toggleTranslation: () => void
  setLanguage: (lang: 'zh' | 'ko') => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  setApiProxyUrl: (url: string) => void
  setProxyAccessToken: (token: string) => void
  setApiModel: (model: string) => void
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {}
  return fallback
}

function saveToStorage(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  showTranslation: true,
  language: 'zh',
  fontSize: 'medium',
  apiProxyUrl: loadFromStorage<string>('riize_api_proxy_url', '') || import.meta.env.VITE_PROXY_URL || '/api',
  proxyAccessToken: loadFromStorage<string>('riize_proxy_access_token', '') || import.meta.env.VITE_PROXY_ACCESS_TOKEN || '',
  apiModel: loadFromStorage<string>('riize_api_model', '') || import.meta.env.VITE_API_MODEL || 'deepseek-chat',

  hasApiKey: () => {
    return get().apiProxyUrl.trim().length > 0
  },

  toggleTranslation: () => set((s) => ({ showTranslation: !s.showTranslation })),
  setLanguage: (lang) => set({ language: lang }),
  setFontSize: (size) => set({ fontSize: size }),

  setApiProxyUrl: (url) => {
    saveToStorage('riize_api_proxy_url', url)
    set({ apiProxyUrl: url })
  },

  setProxyAccessToken: (token) => {
    saveToStorage('riize_proxy_access_token', token)
    set({ proxyAccessToken: token })
  },

  setApiModel: (model) => {
    saveToStorage('riize_api_model', model)
    set({ apiModel: model })
  },
}))
