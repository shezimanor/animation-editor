<script setup lang="ts">
import type { Node } from 'konva/lib/Node';
import type { UUIDTypes } from 'uuid';

console.log('-panel-');
const { metaSymbol } = useShortcuts();
const { mainNodeMap } = useGlobal();
const props = withDefaults(
  defineProps<{
    node: Node | null;
  }>(),
  {
    node: null
  }
);

const emit = defineEmits<{
  (e: 'openModal', id: UUIDTypes): void;
}>();

const currentNode = computed(() => {
  if (!props.node) return null;
  return mainNodeMap.value[props.node.id()];
});
</script>

<template>
  <div class="flex flex-col gap-y-1 rounded p-2 shadow" v-if="currentNode">
    <div class="mb-1 flex items-center justify-between">
      <!-- <h3 class="text-sm font-semibold"></h3> -->
      <UInput v-model="currentNode.label" size="xs" />
      <UTooltip text="刪除圖層" :popper="{ placement: 'bottom' }">
        <UButton
          :padded="false"
          class="delete-button"
          icon="i-heroicons-x-mark-20-solid"
          size="sm"
          color="red"
          variant="link"
        />
      </UTooltip>
    </div>
    <div class="grid grid-cols-2 gap-x-2">
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">Width</UKbd>
        <span class="text-xs text-neutral-500">{{ Math.round(currentNode.width) }}</span>
      </div>
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">Height</UKbd>
        <span class="text-xs text-neutral-500">{{ Math.round(currentNode.height) }}</span>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-x-2">
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">X</UKbd>
        <span class="text-xs text-neutral-500">{{ Math.round(currentNode.x) }}</span>
      </div>
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">Y</UKbd>
        <span class="text-xs text-neutral-500">{{ Math.round(currentNode.y) }}</span>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-x-2">
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">Rotation</UKbd>
        <span class="text-xs text-neutral-500">{{ Math.round(currentNode.rotation) }}</span>
      </div>
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">Opacity</UKbd>
        <span class="text-xs text-neutral-500">{{ currentNode.opacity.toFixed(2) }}</span>
      </div>
    </div>
    <div class="mt-2 flex flex-col items-start gap-y-2 border-t border-neutral-200 pt-2">
      <div class="flex w-full flex-row items-center justify-between">
        <UButton
          size="xs"
          color="gray"
          icon="i-heroicons-plus-solid"
          variant="solid"
          @click="emit('openModal', currentNode.id)"
        >
          新增動畫
        </UButton>
        <div class="flex flex-row gap-x-1">
          <UKbd size="sm">{{ metaSymbol }}</UKbd>
          <UKbd size="sm">E</UKbd>
        </div>
      </div>
      <div class="flex w-full flex-row items-center justify-between">
        <UButton size="xs" icon="i-heroicons-plus-solid" color="gray" variant="solid">
          新增節點
        </UButton>
        <div class="flex flex-row gap-x-1">
          <UKbd size="sm">{{ metaSymbol }}</UKbd>
          <UKbd size="sm">W</UKbd>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
