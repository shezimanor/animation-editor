<script lang="ts" setup>
import type { UUIDTypes } from 'uuid';
const UNNAMED_LABEL = '未命名標籤';

const { transformer, logKonva, getTargetNode } = useKonva();

const { createAnimation } = useGsap();

const isOpen = ref(false);

const currentNodeId = ref<UUIDTypes | null>(null);
const animationLabel = ref(UNNAMED_LABEL);

const resetAnimationLabel = () => {
  animationLabel.value = UNNAMED_LABEL;
};

const closeModal = () => {
  isOpen.value = false;
  resetAnimationLabel();
};

const keydownToCreateAnimationTemplate = (event: KeyboardEvent) => {
  if (event.isComposing) return;
  if (animationLabel.value.trim().length <= 0 || !currentNodeId.value) return;
  createAnimation(getTargetNode(currentNodeId.value), animationLabel.value);
  closeModal();
};

const clickToCreateAnimationTemplate = () => {
  if (animationLabel.value.trim().length <= 0 || !currentNodeId.value) return;
  createAnimation(getTargetNode(currentNodeId.value), animationLabel.value);
  closeModal();
};

const handleOpenModal = (id: UUIDTypes) => {
  isOpen.value = true;
  currentNodeId.value = id;
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
        body: {
          base: '',
          background: '',
          padding: 'p-4 sm:p-4'
        },
        header: {
          base: '',
          background: '',
          padding: 'p-4 sm:p-4'
        },
        footer: {
          base: '',
          background: '',
          padding: 'p-4 sm:p-4'
        },
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
      <div class="flex flex-col gap-y-4">
        <div class="flex items-center gap-x-4">
          <UTooltip text="命名動畫標籤，以便於識別" :popper="{ placement: 'bottom' }">
            <label class="text-sm" name="animationLabel">動畫標籤</label>
          </UTooltip>
          <!-- IME (Input Method Editor) 組成狀態: KeyboardEvent.isComposing 必須用 keydown 觸發 -->
          <UInput
            class="grow"
            v-model="animationLabel"
            name="animationLabel"
            size="sm"
            placeholder="輸入動畫標籤"
            autofocus
            @keydown.enter="keydownToCreateAnimationTemplate"
          />
        </div>
        <div class="text-xs text-neutral-500">
          可按下 Enter 直接新增，後續於時間軸區域編輯動畫。
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-x-2">
          <UButton color="gray" size="xs" variant="ghost" @click="closeModal">取消</UButton>
          <UButton
            size="xs"
            @click="clickToCreateAnimationTemplate"
            :disabled="animationLabel.trim().length <= 0 || !currentNodeId"
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
