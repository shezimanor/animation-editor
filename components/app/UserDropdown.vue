<script setup lang="ts">
const username = ref('Ryan Chen');
</script>

<template>
  <div
    class="flex cursor-pointer flex-row items-center gap-x-1.5 rounded-md p-2 transition hover:bg-neutral-100"
  >
    <UAvatar
      :alt="username"
      size="sm"
      :ui="{
        background:
          'bg-gradient-to-br from-green-300 via-teal-300 to-blue-300 dark:from-green-300 dark:via-teal-500 dark:to-blue-600',
        placeholder: 'font-medium leading-none text-neutral-600 dark:text-white truncate'
      }"
    />
    <!-- <span
      class="h-7 w-7 rounded-full bg-gradient-to-br from-green-300 via-teal-500 to-blue-600"
    ></span> -->
    <span class="text-sm">{{ username }}</span>
    <Icon name="ic:round-keyboard-arrow-down" class="text-neutral-500" size="20px" />
  </div>
</template>

<style scoped></style>
