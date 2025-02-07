/** @type {import('tailwindcss').Config} */
// https://tailwindcss.nuxtjs.org/tailwind/config
export default {
  content: [],
  theme: {
    screens: {
      tablet: '640px',
      // => @media (min-width: 640px) { ... }

      tabletLg: '768px',
      // => @media (min-width: 768px) { ... }

      laptop: '960px',
      // => @media (min-width: 960px) { ... }

      desktop: '1280px'
      // => @media (min-width: 1280px) { ... }
    },
    extend: {
      // default spacing: https://tailwindcss.com/docs/customizing-spacing#default-spacing-scale
      spacing: {
        13: '3.25rem', // 52px
        15: '3.75rem', // 60px
        18: '4.5rem', // 72px
        25: '6.25rem', // 100px
        76: '19rem', // 304px
        128: '32rem', // 512px
        144: '36rem', // 576px
        160: '40rem', // 640px
        180: '45rem' // 720px
      },
      boxShadow: {
        std: '0 0 10px rgba(0, 0, 0, 0.2)',
        lite: '0 0 6px rgba(0, 0, 0, 0.2)'
      },
      screens: {
        '2xl': '1440px',
        '768px': '768px'
        // => @media (min-width: 1440px) { ... }
        // '3xl': '1536px'
        // => @media (min-width: 1536px) { ... }
      }
    }
  }
};
