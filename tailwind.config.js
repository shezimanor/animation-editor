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
      spacing: {
        15: '60px',
        18: '72px',
        '2/5': '40%'
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
