<script lang="ts" setup>
const modal = useModal();
withDefaults(
  defineProps<{
    title: string;
    content: string;
  }>(),
  {
    title: '刪除',
    content: '確定要刪除嗎？'
  }
);
const emit = defineEmits(['delete']);
</script>
<template>
  <UModal
    :ui="{
      wrapper: 'z-[200]',
      container: 'items-center',
      width: 'w-full max-w-160',
      shadow: 'shadow'
    }"
    :transition="false"
  >
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        shadow: 'shadow-none',
        header: {
          base: '',
          background: '',
          padding: 'p-3 sm:px-5'
        },
        body: {
          base: '',
          background: '',
          padding: 'px-3 py-4 sm:p-6'
        },
        footer: {
          base: '',
          background: '',
          padding: 'p-3 sm:px-5'
        }
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ title }}</h3>
          <UButton
            :padded="false"
            class="delete-button"
            icon="i-heroicons-x-mark-20-solid"
            size="sm"
            color="gray"
            variant="link"
            @click="modal.close()"
          />
        </div>
      </template>
      <div class="text-sm">{{ content }}</div>
      <template #footer>
        <div class="flex justify-end gap-x-2">
          <UButton color="gray" @click="modal.close()">取消</UButton>
          <UButton color="rose" @click="emit('delete')">刪除</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<style></style>
