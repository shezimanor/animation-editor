<script setup lang="ts">
import type { AdModuleConfig } from '~/pages/index.vue';
const adModule = useCookie<AdModuleConfig>('adModuleInfo', AD_MODULE_COOKIE_CONFIG);
const { isClipMode, addLayerClip, removeLayerClip } = useKonva({
  width: adModule.value.width,
  height: adModule.value.height
});

// 切換裁切模式
watch(isClipMode, (newValue) => {
  if (newValue) {
    addLayerClip();
  } else {
    removeLayerClip();
  }
});
</script>

<template>
  <header
    class="fixed left-0 top-0 z-[100] flex h-14 w-full flex-row items-center justify-between px-4 shadow"
  >
    <div class="flex flex-row items-center gap-x-2 text-neutral-700">
      <span
        class="mr-2 flex flex-row items-center gap-x-2 rounded px-2 py-1.5 font-bold dark:bg-white"
      >
        <Icon name="i-clarity-animation-solid" size="1.25em" class="hover:opacity-75" />
        動畫編輯器
      </span>
    </div>
    <AppTimelineController
      class="absolute bottom-0 left-0 right-0 top-0 m-auto h-10 w-10 rounded-md bg-white py-0 shadow-std"
    />
    <div class="flex flex-row items-center gap-x-2">
      <UBadge color="primary" variant="soft">{{ adModule.width + ' x ' + adModule.height }}</UBadge>
      <!-- 有 Bug 暫時不用 -->
      <UCheckbox v-model="isClipMode" name="isClipMode" label="隱藏空白區域" />
    </div>
  </header>
</template>

<style scoped></style>
