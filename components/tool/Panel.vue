<script setup lang="ts">
const { currentTool, closeTool } = useTool();
const { addImage } = useKonva();
const panelRef = ref<HTMLDivElement | null>(null);
const file = ref<File | null>(null);
const imgObj = ref<HTMLImageElement | null>(null);
const loading = ref(false);
const escapeEventHandler = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeTool();
  }
};
const handleFileUpload = async (event: InputEvent) => {
  loading.value = true;
  const input = <HTMLInputElement>event.target;
  // 獲取檔案列表
  const files = input.files;
  if (files && files.length > 0) {
    file.value = files[0];
  }
  try {
    if (file.value) imgObj.value = await getImageData(file.value);
  } catch {
    throw new Error('Failed to get image data.');
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  if (panelRef.value) {
    panelRef.value.addEventListener('keydown', escapeEventHandler);
    panelRef.value.focus();
  }
});

onUnmounted(() => {
  if (panelRef.value) panelRef.value.removeEventListener('keydown', escapeEventHandler);
});
</script>

<template>
  <div class="panel-wrapper">
    <div ref="panelRef" class="panel" tabindex="1">
      <div class="panel__inner-container" v-if="currentTool">
        <div class="flex w-full flex-row flex-nowrap gap-x-2">
          <UInput
            type="file"
            size="sm"
            icon="i-ic-outline-photo-size-select-actual"
            accept="image/*"
            @input="handleFileUpload"
            class="flex-grow"
          />
          <UButton
            size="sm"
            :loading="loading"
            :disabled="!(file && imgObj)"
            @click="addImage(<HTMLImageElement>imgObj)"
            >新增</UButton
          >
        </div>
      </div>
    </div>
    <UButton
      class="panel__close-button"
      icon="i-heroicons-x-mark-20-solid"
      size="md"
      color="white"
      square
      variant="soft"
      @click="closeTool"
    />
  </div>
</template>

<style scoped lang="scss">
.panel-wrapper {
  @apply fixed left-18 top-0 z-10 flex h-screen flex-row items-start gap-x-4 pb-2 pt-16;
}
.panel {
  @apply relative z-[12] h-full w-80 rounded-lg bg-white shadow-std dark:bg-neutral-900;

  &__inner-container {
    @apply w-full p-4;
  }

  &__close-button {
    @apply rounded-full bg-white shadow-lite hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-500 hover:dark:bg-neutral-700;
  }
}
</style>
