<script lang="ts" setup>
import type { Node } from 'konva/lib/Node';
const { toastError } = useNotify();

const modal = useModal();
const props = withDefaults(
  defineProps<{
    title: string;
    content: string;
    node: Node;
  }>(),
  {
    title: '替換圖片',
    content: '將圖片拖曳進來，再按下確認。'
  }
);
const emit = defineEmits<{
  save: [img: HTMLImageElement];
}>();

const activeColor = 'bg-green-50';
const originImgSrc = ref('');
const newImg = ref<HTMLImageElement | null>(null);
const newImgSrc = ref('');
const modalBody = ref<HTMLDivElement | null>(null);

const handleDropLeave = (e: DragEvent) => {
  modalBody.value?.parentElement?.classList.remove(activeColor);
  e.stopPropagation();
  e.preventDefault();
};

const handleDropOver = (e: DragEvent) => {
  modalBody.value?.parentElement?.classList.add(activeColor);
  e.stopPropagation();
  e.preventDefault();
};

const handleDrop = async (e: DragEvent) => {
  e.stopPropagation();
  e.preventDefault();
  const fileList = e.dataTransfer?.files;
  if (!fileList || fileList.length === 0) return;
  // 先檢查 fileList 內的第一個檔案是否為圖片，若非圖片檔案則不處理
  const isImage = isSupportedImageFile(fileList[0]);
  if (!isImage) {
    toastError('僅支援圖片檔案(jpg, png)');
    return;
  }
  try {
    const imgObj = await getImageData(fileList[0]);
    newImgSrc.value = imgObj.src;
    newImg.value = imgObj;
    // console.log(imgObj.naturalWidth, imgObj.naturalHeight);
  } catch {
    toastError('圖片載入失敗');
  } finally {
    e.dataTransfer?.clearData();
    modalBody.value?.parentElement?.classList.remove(activeColor);
  }
};

onMounted(() => {
  console.log('onMounted');
  originImgSrc.value = props.node.attrs.image.src;
});
</script>
<template>
  <UModal
    :ui="{
      wrapper: 'z-[200]',
      container: 'items-center',
      width: 'w-full max-w-120',
      shadow: 'shadow'
    }"
    :transition="false"
  >
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        shadow: 'shadow-none',
        header: {
          base: '',
          background: '',
          padding: 'p-3 sm:px-5'
        },
        body: {
          base: '',
          background: '',
          padding: 'px-3 py-4 sm:p-6'
        },
        footer: {
          base: '',
          background: '',
          padding: 'p-3 sm:px-5'
        }
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ title }}</h3>
          <UButton
            :padded="false"
            class="delete-button"
            icon="i-heroicons-x-mark-20-solid"
            size="sm"
            color="gray"
            variant="link"
            @click="modal.close()"
          />
        </div>
      </template>
      <div
        ref="modalBody"
        class="flex flex-col gap-y-2 text-sm"
        @dragover="handleDropOver"
        @dragleave="handleDropLeave"
        @dragenter.prevent.stop
        @drop="handleDrop"
      >
        <p>{{ content }}</p>
        <div class="flex flex-row items-center justify-between px-4">
          <img :src="originImgSrc" alt="image" class="img-item" />
          <UIcon name="i-mdi-arrow-right-thick" class="h-12 w-12 text-neutral-500" />
          <div
            v-if="newImgSrc.length === 0"
            class="flex h-36 w-36 items-center justify-center rounded border bg-neutral-100"
          >
            <UIcon name="i-icon-park-outline-upload-picture" class="h-10 w-10 text-neutral-400" />
          </div>
          <img v-else :src="newImgSrc" alt="image" class="img-item" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-x-2">
          <UButton color="gray" @click="modal.close()">取消</UButton>
          <UButton
            color="primary"
            :disabled="!newImg"
            @click="emit('save', <HTMLImageElement>newImg)"
            >確認</UButton
          >
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<style lang="scss" scoped>
.img-item {
  @apply h-36 w-36 rounded border bg-white object-contain dark:bg-neutral-800;
}
</style>
