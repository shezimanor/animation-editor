import removeConsole from 'vite-plugin-remove-console';
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@nuxtjs/google-fonts',
    '@nuxt/icon',
    '@nuxt/ui'
  ],
  devtools: { enabled: true },
  css: ['~/assets/scss/main.scss'],
  compatibilityDate: '2024-11-01',
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // 為了解決 deprecated Warnings https://sass-lang.com/documentation/breaking-changes/legacy-js-api/
          api: 'modern-compiler'
        }
      }
    },
    plugins: [removeConsole()]
  },
  eslint: {
    config: {
      stylistic: {
        semi: true,
        commaDangle: 'never'
      }
    }
  },
  i18n: {
    baseUrl: 'http://localhost:3000', // TODO:
    locales: [
      {
        name: '繁體中文',
        code: 'zh',
        language: 'zh-TW',
        file: 'zh.json'
      },
      {
        name: 'en',
        code: 'en',
        language: 'en',
        file: 'en.json'
      },
      {
        name: 'Ja',
        code: 'jp',
        language: 'ja',
        file: 'ja.json'
      }
    ],
    defaultLocale: 'zh' // locale code
    // detectBrowserLanguage: false
  },
  colorMode: {
    preference: 'light', // default value of $colorMode.preference
    fallback: 'light',
    classSuffix: '', // 把 '-mode' 去掉，對齊 tailwind 的設定
    storage: 'sessionStorage'
  },
  googleFonts: {
    display: 'swap',
    families: {
      'Open+Sans': [300, 500, 700]
    }
  }
});
