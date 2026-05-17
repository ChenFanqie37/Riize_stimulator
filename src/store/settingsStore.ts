import { create } from 'zustand'

interface SettingsState {
  showTranslation: boolean
  language: 'zh' | 'ko'
  fontSize: 'small' | 'medium' | 'large'
  apiKeys: string[]
  apiBaseUrl: string
  apiModel: string
  hasApiKey: () => boolean
  toggleTranslation: () => void
  setLanguage: (lang: 'zh' | 'ko') => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  setApiKeys: (keys: string[]) => void
  setApiBaseUrl: (url: string) => void
  setApiModel: (model: string) => void
  addApiKey: (key: string) => void
  removeApiKey: (index: number) => void
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

function loadEnvKeys(): string[] {
  const keys: string[] = []
  let i = 1
  while (true) {
    const key = import.meta.env[`VITE_API_KEY_${i}`]
    if (!key || key === 'your_api_key_here') break
    keys.push(key)
    i++
  }
  return keys
}

const envKeys = loadEnvKeys()
const storedKeys = loadFromStorage<string[]>('riize_api_keys', [])
const initialKeys = storedKeys.length > 0 ? storedKeys : envKeys

export const useSettingsStore = create<SettingsState>((set, get) => ({
  showTranslation: true,
  language: 'zh',
  fontSize: 'medium',
  apiKeys: initialKeys,
  apiBaseUrl: loadFromStorage<string>('riize_api_base_url', '') || import.meta.env.VITE_API_BASE_URL || 'https://api.deepseek.com',
  apiModel: loadFromStorage<string>('riize_api_model', '') || import.meta.env.VITE_API_MODEL || 'deepseek-chat',

  hasApiKey: () => {
    const keys = get().apiKeys
    return keys.length > 0 && keys[0] !== 'YOUR_API_KEY_HERE' && keys[0].length > 10
  },

  toggleTranslation: () => set((s) => ({ showTranslation: !s.showTranslation })),
  setLanguage: (lang) => set({ language: lang }),
  setFontSize: (size) => set({ fontSize: size }),

  setApiKeys: (keys) => {
    saveToStorage('riize_api_keys', keys)
    set({ apiKeys: keys })
  },

  setApiBaseUrl: (url) => {
    saveToStorage('riize_api_base_url', url)
    set({ apiBaseUrl: url })
  },

  setApiModel: (model) => {
    saveToStorage('riize_api_model', model)
    set({ apiModel: model })
  },

  addApiKey: (key) => {
    const keys = [...get().apiKeys, key]
    saveToStorage('riize_api_keys', keys)
    set({ apiKeys: keys })
  },

  removeApiKey: (index) => {
    const keys = get().apiKeys.filter((_, i) => i !== index)
    saveToStorage('riize_api_keys', keys)
    set({ apiKeys: keys })
  },
}))
