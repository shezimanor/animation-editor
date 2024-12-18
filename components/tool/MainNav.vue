<script setup lang="ts">
const { activeTools } = useTool();
</script>

<template>
  <nav class="flex h-full w-18 flex-none flex-col bg-neutral-100 pt-2 dark:bg-neutral-950">
    <ToolNavButton
      v-for="{ id, icon, label, feature, hoverClass, highlight } in activeTools"
      :key="id"
      :id="id"
      :icon="icon"
      :label="label"
      :feature="feature"
      :hover-class="hoverClass"
      :highlight="highlight"
    />
  </nav>
</template>

<style scoped></style>
