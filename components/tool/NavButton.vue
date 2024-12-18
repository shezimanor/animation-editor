<script setup lang="ts">
const { openTool, currentToolId } = useTool();

const props = withDefaults(
  defineProps<{
    id: number;
    label: string;
    icon: string;
    feature: string;
    hoverClass: string;
    highlight: boolean;
  }>(),
  {
    id: 0,
    label: '工具',
    icon: 'material-symbols-light:settings-outline',
    feature: 'tool',
    hoverClass: 'hover:text-black',
    highlight: false
  }
);
const activeClass = computed(() => props.hoverClass.replace('hover:', ''));
const activeButton = computed(() => currentToolId.value === props.id);
</script>

<template>
  <button class="nav-button" :class="['text-neutral-500', hoverClass]" @mouseenter="openTool(id)">
    <div
      class="nav-button__icon-outline"
      :class="{
        'bg-white': activeButton,
        'dark:bg-neutral-800': activeButton,
        shadow: activeButton
      }"
    >
      <Icon :name="icon" size="24px" :class="[activeButton ? activeClass : '']" />
      <div v-if="highlight" class="nav-button__chip">
        <Icon name="solar:crown-bold" size="10px" />
      </div>
    </div>
    <span class="nav-button__label">{{ label }}</span>
  </button>
</template>

<style scoped lang="scss">
.nav-button {
  @apply flex h-18 w-18 cursor-pointer flex-col items-center justify-center gap-y-1.5;

  &:hover {
    .nav-button__icon-outline {
      @apply bg-white shadow dark:bg-neutral-800;
    }
    .nav-button__label {
      @apply text-neutral-500 dark:text-neutral-200;
    }
  }

  &__icon-outline {
    @apply relative flex h-8 w-8 items-center justify-center rounded-lg transition duration-300 dark:text-neutral-200;
  }

  &__label {
    @apply text-[11px] leading-tight text-neutral-500 dark:text-neutral-200;
  }

  &__chip {
    @apply absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-white;
  }
}
</style>
