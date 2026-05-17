/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY_1: string
  readonly VITE_API_KEY_2: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
