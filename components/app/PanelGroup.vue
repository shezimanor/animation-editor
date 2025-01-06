<script lang="ts" setup>
import type { UUIDTypes } from 'uuid';

const { transformer, logKonva } = useKonva();

const isOpen = ref(false);

const animationLabel = ref('新的動畫標籤');

const resetAnimationLabel = () => {
  animationLabel.value = '新的動畫標籤';
};

const closeModal = () => {
  isOpen.value = false;
  resetAnimationLabel();
};

const createAnimation = () => {
  console.log('createAnimation', animationLabel.value);
  closeModal();
};

const beforeCreateAnimation = (event: KeyboardEvent) => {
  if (event.isComposing) return;
  if (animationLabel.value.trim().length <= 0) return;
  createAnimation();
};

const handleOpenModal = (id: UUIDTypes) => {
  isOpen.value = true;
};
</script>

<template>
  <div class="panel-group-wrapper">
    <header class="flex items-center justify-between">
      <h2>圖層資訊</h2>
      <UButton size="xs" @click="logKonva">Log</UButton>
    </header>
    <div v-if="transformer && transformer?.nodes().length > 0">
      <AppPanel
        v-for="node in transformer.nodes()"
        :key="node.id"
        :node="node"
        @open-modal="handleOpenModal"
      />
    </div>
  </div>
  <UModal
    v-model="isOpen"
    :ui="{
      wrapper: 'z-[200]',
      container: 'items-center',
      width: 'w-full max-w-[640px]',
      shadow: 'shadow'
    }"
    :transition="false"
    prevent-close
  >
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        shadow: 'shadow-none'
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 dark:text-white">新增動畫</h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="closeModal"
          />
        </div>
      </template>
      <div class="flex items-center gap-x-4">
        <label class="text-sm" name="animationLabel">動畫標籤</label>
        <!-- IME (Input Method Editor) 組成狀態: KeyboardEvent.isComposing 必須用 keydown 觸發 -->
        <UInput
          class="grow"
          v-model="animationLabel"
          name="animationLabel"
          size="sm"
          placeholder="輸入動畫標籤"
          autofocus
          @keydown.enter="beforeCreateAnimation"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-x-2">
          <UButton color="gray" size="xs" variant="ghost" @click="closeModal">取消</UButton>
          <UButton size="xs" @click="createAnimation" :disabled="animationLabel.trim().length <= 0"
            >新增</UButton
          >
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<style lang="scss" scoped>
.panel-group-wrapper {
  @apply fixed right-4 top-15 z-[12] flex w-[240px] flex-col rounded-lg bg-white px-3 py-2 shadow-std dark:bg-neutral-900;
}
</style>
