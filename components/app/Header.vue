<script setup lang="ts">
import type { AdModuleConfig } from '~/pages/index.vue';
import UserDropdown from './UserDropdown.vue';
const adModule = useCookie<AdModuleConfig>('adModuleInfo');
const isHidedGridDot = useState('isHidedGridDot', () => false);
const sizeIndex = computed(() => {
  if (!adModule.value) return 0;
  const size = `${adModule.value.width}x${adModule.value.height}`;
  switch (size) {
    case '640x320':
      return 1;
    case '640x1386':
      return 2;
    case '320x480':
    default:
      return 0;
  }
});
const options = ref([
  {
    id: 1,
    width: 320,
    height: 480
  },
  {
    id: 2,
    width: 640,
    height: 320
  },
  {
    id: 3,
    width: 640,
    height: 1386
  }
]);
const selectedModule = ref(options.value[sizeIndex.value]);

const changeModule = () => {
  adModule.value.width = selectedModule.value.width;
  adModule.value.height = selectedModule.value.height;
  navigateTo('/');
};
</script>

<template>
  <header
    class="fixed left-0 top-0 z-[100] flex h-14 w-full flex-row items-center justify-between pl-4 pr-2 shadow"
  >
    <div class="flex flex-row items-center gap-x-2 text-neutral-700">
      <NuxtLink
        to="/"
        class="mr-2 flex flex-row items-center gap-x-2 rounded px-2 py-1.5 font-bold dark:bg-white"
      >
        <Icon name="gravity-ui:timeline" size="1.25em" class="hover:opacity-75" /> 捲軸動畫編輯器
      </NuxtLink>
      <AppGhostButton>下載</AppGhostButton>
    </div>
    <div class="flex flex-row items-center gap-x-2">
      <USelectMenu v-model="selectedModule" :options="options" class="w-32" @change="changeModule">
        <template #leading>
          <UBadge color="primary" variant="soft">{{
            selectedModule.width + ' x ' + selectedModule.height
          }}</UBadge>
        </template>
        <template #option="{ option: adModule }">
          <UBadge :color="selectedModule.id === adModule.id ? 'primary' : 'gray'" variant="soft">{{
            adModule.width + ' x ' + adModule.height
          }}</UBadge>
        </template>
      </USelectMenu>
      <UCheckbox v-model="isHidedGridDot" name="isHidedGridDot" label="隱藏網格點" />
      <UserDropdown />
    </div>
  </header>
</template>

<style scoped></style>
