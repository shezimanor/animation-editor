<script lang="ts" setup>
console.log('-panel group-');
import { useDebounceFn } from '@vueuse/core';
const { currentTime, mainTransformer, mainNodeMap, logGsapTimeline } = useGlobal();
const { updateNodeAndMainNodeAttributes, logKonvaJSON } = useKonva();

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
      <h2>圖層資訊</h2>
      <div class="flex gap-x-1">
        <UButton size="xs" @click="logKonvaJSON">json</UButton>

        <UButton size="xs" @click="logGsapTimeline">Log</UButton>
      </div>
    </header>
    <div
      v-if="mainTransformer && mainTransformer?.nodes().length > 0"
      class="flex flex-col gap-y-2"
    >
      <AppPanel v-for="node in mainTransformer.nodes()" :key="node.id" :node="node" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.panel-group-wrapper {
  @apply fixed right-4 top-15 z-[12] flex w-80 flex-col gap-y-2 rounded-lg bg-white px-2 py-2 shadow-std dark:bg-neutral-900;
}
</style>
