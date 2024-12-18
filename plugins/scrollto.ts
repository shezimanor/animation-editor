// https://github.com/rigor789/vue-scrollto
import VueScrollTo from 'vue-scrollto';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueScrollTo);

  return {
    provide: {
      // 在這個 provide 的物件中可回傳一個或多個函式
      // helper: provide 物件內的函式會提供給 Nuxt 應用程式中做使用
      // 透過插件所提供的 helper 在 Nuxt instance 中，都可以加上 $ 來做呼叫
      // 也可以在 template 中，直接使用 scrollTo 這個 helper (也要加上 $)
      scrollTo: VueScrollTo.scrollTo
    }
  };
});
