<script lang="ts" setup>
const { t } = useI18n();
const i18nHead = useLocaleHead();

useHead({
  title: '捲軸動畫編輯器 | Cr.ED',
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs!.lang,
    dir: i18nHead.value.htmlAttrs!.dir
  },
  link: [
    ...(i18nHead.value.link || []),
    {
      rel: 'icon',
      href: '/favicon.ico'
    }
  ],
  meta: [
    ...(i18nHead.value.meta || []),
    {
      name: 'locale',
      content: t('localeValue')
    }
  ]
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications
      :ui="{
        width: 'w-72'
      }"
    />
  </div>
</template>
