/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_HTTPS_PROXY: string
  readonly VITE_OPENAI_API_BASE_URL: string
  readonly VITE_HEAD_SCRIPTS: string
  readonly VITE_SECRET_KEY: string
  readonly VITE_SITE_PASSWORD: string
  readonly VITE_OPENAI_API_MODEL: string
  readonly VITE_CONNECT_STRING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
