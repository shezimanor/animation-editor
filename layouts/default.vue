<script setup lang="ts"></script>

<template>
  <div class="flex w-full min-w-96 flex-col">
    <AppHeader />
    <div class="h-screen pt-14">
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
