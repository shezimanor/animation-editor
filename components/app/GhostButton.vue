<script setup lang="ts">
defineProps<{
  to?: string;
}>();
</script>

<template>
  <UButton color="white" variant="ghost" :to="to" class="hover:bg-neutral-100">
    <slot />
  </UButton>
</template>

<style scoped></style>
