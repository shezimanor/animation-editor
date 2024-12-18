<script setup lang="ts">
import UserDropdown from './UserDropdown.vue';
const todo = () => {
  console.log('todo');
};
</script>

<template>
  <header
    class="fixed left-0 top-0 z-[100] flex h-14 w-full flex-row items-center justify-between pl-4 pr-2 shadow"
  >
    <div class="flex flex-row items-center gap-x-2 text-neutral-700">
      <NuxtLink
        to="/"
        class="mr-2 flex flex-row items-center gap-x-2 rounded px-2 py-1.5 font-bold dark:bg-white"
      >
        <Icon name="gravity-ui:timeline" size="1.25em" class="hover:opacity-75" /> 捲軸動畫編輯器
      </NuxtLink>
      <AppGhostButton>下載</AppGhostButton>
    </div>
    <div class="flex flex-row gap-x-2">
      <UserDropdown />
    </div>
  </header>
</template>

<style scoped></style>
