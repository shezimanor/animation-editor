<script lang="ts" setup>
import type { UUIDTypes } from 'uuid';

const { transformer, logKonva } = useKonva();

const isOpen = ref(false);

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
  <UModal v-model="isOpen" :ui="{ wrapper: 'z-[200]' }"></UModal>
</template>

<style lang="scss" scoped>
.panel-group-wrapper {
  @apply fixed right-4 top-15 z-[12] flex w-[240px] flex-col rounded-lg bg-white px-3 py-2 shadow-std dark:bg-neutral-900;
}
</style>
