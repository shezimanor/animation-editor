<script lang="ts" setup>
// console.log('-panel group-');
import { useDebounceFn } from '@vueuse/core';
const { currentTime, mainTransformer, mainNodeMap, logGsapTimeline } = useGlobal();
const { updateNodeAndMainNodeAttributes, resetZooming, logKonvaJSON } = useKonva();

const debouncedUpdateMainNode = useDebounceFn(() => {
  updateMainNode();
}, 17);
const updateMainNode = () => {
  const selectedNodes = mainTransformer.value?.nodes();
  if (!selectedNodes) return;
  selectedNodes.forEach((node) => {
    const targetMainNode = mainNodeMap.value[node.id()];
    if (targetMainNode) updateNodeAndMainNodeAttributes(node, targetMainNode);
  });
};

// watcher `currentTime`
watch(currentTime, () => {
  // 延遲校正 mainNode 的屬性
  debouncedUpdateMainNode();
});
</script>

<template>
  <div class="panel-group-wrapper">
    <header class="flex items-center justify-between">
      <h2 class="text-sm">圖層資訊</h2>
      <div class="flex flex-row items-center gap-x-1">
        <UKbd size="xs"
          ><UIcon name="i-material-symbols-keyboard-command-key" class="h-3 w-3"
        /></UKbd>
        +
        <UKbd size="xs"><UIcon name="i-iconamoon-mouse" class="h-3 w-3" /></UKbd>
        <UTooltip text="點擊還原100%" :popper="{ placement: 'bottom' }">
          <span class="ml-1.5 cursor-pointer text-xs hover:text-blue-500" @click="resetZooming"
            >縮放畫布</span
          >
        </UTooltip>
      </div>
    </header>
    <div v-if="mainTransformer && mainTransformer.nodes().length > 0" class="flex flex-col">
      <AppPanel v-for="node in mainTransformer.nodes()" :key="node.id" :node="node" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.panel-group-wrapper {
  @apply w-76 fixed right-4 top-15 z-[12] flex flex-col rounded-lg bg-white px-2 py-2 shadow-std dark:bg-neutral-900;
}
</style>
