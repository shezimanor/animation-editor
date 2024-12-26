<script setup lang="ts">
import type { Node } from 'konva/lib/Node';
import type { UUIDTypes } from 'uuid';
const { mainNodeList, addAnimation } = useKonva();

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
  return mainNodeList.value.find((node) => node.id === props.node?.id());
});
</script>

<template>
  <div class="flex flex-col gap-y-1 py-1" v-if="currentNode">
    <div class="mb-1 flex items-center justify-between">
      <!-- <h3 class="text-sm font-semibold"></h3> -->
      <UInput v-model="currentNode.label" size="xs" />
      <UButton
        :padded="false"
        class="delete-button"
        icon="i-heroicons-x-mark-20-solid"
        size="sm"
        color="red"
        variant="link"
      />
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
    <div class="flex justify-start">
      <UButton size="xs" @click="emit('openModal', currentNode.id)">建立動畫</UButton>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
