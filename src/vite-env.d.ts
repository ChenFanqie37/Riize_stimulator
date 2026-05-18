/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROXY_URL: string
  readonly VITE_PROXY_ACCESS_TOKEN: string
  readonly VITE_API_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
