/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHEET_ID: string
  readonly VITE_SHEETS_API_KEY: string
  readonly VITE_SHEET_NAME: string
  readonly VITE_YOUTUBE_API_KEY: string
  readonly VITE_YOUTUBE_PLAYLIST_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
