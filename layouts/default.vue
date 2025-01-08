<script setup lang="ts"></script>

<template>
  <div class="min-w-180 flex w-full flex-col">
    <AppHeader />
    <div class="min-h-180 h-screen pt-14">
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
