/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_LOGIN_URL: string;
  readonly VITE_REGISTER_URL: string;
  readonly VITE_AUTH_GOOGLE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
