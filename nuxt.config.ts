import removeConsole from 'vite-plugin-remove-console';
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    baseURL: '/animation-editor/'
  },
  router: {
    options: {
      hashMode: true
    }
  },
  modules: [
    '@nuxt/eslint',
    '@vueuse/nuxt',
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
