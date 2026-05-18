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

function envApiKeys(): string[] {
  return [
    import.meta.env.VITE_API_KEYS || '',
    import.meta.env.VITE_API_KEY_1 || '',
    import.meta.env.VITE_API_KEY_2 || '',
    import.meta.env.VITE_API_KEY_3 || '',
    import.meta.env.VITE_API_KEY_4 || '',
  ].join('\n')
    .split(/[\n,;]+/)
    .map((key) => key.trim())
    .filter(Boolean)
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  showTranslation: true,
  language: 'zh',
  fontSize: 'medium',
  apiKeys: loadFromStorage<string[]>('riize_api_keys', envApiKeys()),
  apiBaseUrl: loadFromStorage<string>('riize_api_base_url', '') || import.meta.env.VITE_API_BASE_URL || 'https://api.deepseek.com',
  apiModel: loadFromStorage<string>('riize_api_model', '') || import.meta.env.VITE_API_MODEL || 'deepseek-chat',

  hasApiKey: () => {
    return get().apiKeys.some((key) => key.trim().length > 0)
  },

  toggleTranslation: () => set((s) => ({ showTranslation: !s.showTranslation })),
  setLanguage: (lang) => set({ language: lang }),
  setFontSize: (size) => set({ fontSize: size }),

  setApiKeys: (keys) => {
    const cleanKeys = keys.map((key) => key.trim()).filter(Boolean)
    saveToStorage('riize_api_keys', cleanKeys)
    set({ apiKeys: cleanKeys })
  },

  setApiBaseUrl: (url) => {
    saveToStorage('riize_api_base_url', url)
    set({ apiBaseUrl: url })
  },

  setApiModel: (model) => {
    saveToStorage('riize_api_model', model)
    set({ apiModel: model })
  },
}))
