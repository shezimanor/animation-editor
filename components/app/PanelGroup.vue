<script lang="ts" setup>
const { transformer } = useKonva();
</script>

<template>
  <div class="panel-group-wrapper">
    <header>
      <h2>圖層資訊</h2>
    </header>
    <div v-if="transformer && transformer?.nodes().length > 0">
      <AppPanel v-for="node in transformer.nodes()" :key="node.id" :node="node" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.panel-group-wrapper {
  @apply fixed right-4 top-15 z-[12] flex w-[240px] flex-col rounded-lg bg-white px-3 py-2 shadow-std dark:bg-neutral-900;
}
</style>
