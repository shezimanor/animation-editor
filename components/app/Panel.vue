<script setup lang="ts">
import type { Node } from 'konva/lib/Node';

console.log('-panel-');
const { mainNodeMap, currentActiveAnimationId, getTargetNodeFromTimeline } = useGlobal();
const { updateKonvaNodeAttribute } = useKonva();
const { gsapTimelineNodeMap, updateGsapTimelineByTween, removeTween } = useGsap();

const props = withDefaults(
  defineProps<{
    node: Node | null;
  }>(),
  {
    node: null
  }
);

const emit = defineEmits<{
  (e: 'openModal', id: string): void;
}>();

const currentNode = computed(() => {
  if (!props.node) return null;
  return mainNodeMap.value[props.node.id()];
});

// 用來確認 active 的動畫是否屬於當前的素材節點
const currentBarTweenObject = computed(() => {
  if (!currentNode.value || !currentActiveAnimationId.value) return null;
  const currentGsapTimelineNode = gsapTimelineNodeMap[currentNode.value.id];
  const tweenObject = currentGsapTimelineNode
    ? currentGsapTimelineNode[currentActiveAnimationId.value]
    : null;
  return tweenObject;
});

// current BarNode
const currentBarNode = computed(() => {
  if (!currentActiveAnimationId.value || !props.node) return null;
  return (
    getTargetNodeFromTimeline(`bar_${currentActiveAnimationId.value}_${props.node.id()}`) || null
  );
});

const updateKonvaNode = (attrName: string, newValue: number) => {
  if (!currentNode.value || !props.node) return;
  updateKonvaNodeAttribute(props.node, attrName, newValue);
};

// 更新起始點
const updateAnimationBarFromVars = () => {
  console.log('updateAnimationBarFromVars');
  if (!currentBarTweenObject.value || !currentBarNode.value || !currentNode.value || !props.node)
    return;
  updateGsapTimelineByTween(
    currentBarTweenObject.value,
    currentBarNode.value,
    currentNode.value,
    props.node,
    'fromVars'
  );
};

// 更新結尾點
const updateAnimationBarToVars = () => {
  console.log('updateAnimationBarToVars');
  if (!currentBarTweenObject.value || !currentBarNode.value || !currentNode.value || !props.node)
    return;
  updateGsapTimelineByTween(
    currentBarTweenObject.value,
    currentBarNode.value,
    currentNode.value,
    props.node,
    'toVars'
  );
};
</script>

<template>
  <div class="flex flex-col gap-y-1 rounded p-2 shadow" v-if="currentNode">
    <div class="mb-1 flex items-center justify-between">
      <!-- <h3 class="text-sm font-semibold"></h3> -->
      <UInput v-model="currentNode.label" size="xs" />
      <UTooltip text="刪除圖層" :popper="{ placement: 'bottom' }">
        <UButton
          :padded="false"
          class="delete-button"
          icon="i-heroicons-x-mark-20-solid"
          size="sm"
          color="red"
          variant="link"
        />
      </UTooltip>
    </div>
    <div class="grid grid-cols-2 gap-x-2">
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">Width</UKbd>
        <AppQuickInput v-model="currentNode.width" @change="updateKonvaNode('width', $event)" />
      </div>
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">Height</UKbd>
        <AppQuickInput v-model="currentNode.height" @change="updateKonvaNode('height', $event)" />
      </div>
    </div>
    <div class="grid grid-cols-2 gap-x-2">
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">X</UKbd>
        <AppQuickInput v-model="currentNode.x" @change="updateKonvaNode('x', $event)" />
      </div>
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">Y</UKbd>
        <AppQuickInput v-model="currentNode.y" @change="updateKonvaNode('y', $event)" />
      </div>
    </div>
    <div class="grid grid-cols-2 gap-x-2">
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">Rotation</UKbd>
        <AppQuickInput
          v-model="currentNode.rotation"
          @change="updateKonvaNode('rotation', $event)"
        />
      </div>
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">Opacity</UKbd>
        <AppQuickInput
          v-model="currentNode.opacity"
          :max="1"
          :min="0"
          :step="0.1"
          @change="updateKonvaNode('opacity', $event)"
        />
      </div>
    </div>
    <!-- 圖片素材操作 -->
    <div class="mt-1 flex flex-col items-start gap-y-2 border-t border-neutral-200 pt-2">
      <div class="flex w-full flex-row items-center justify-start gap-x-2">
        <UButton
          size="xs"
          color="gray"
          icon="i-heroicons-plus-solid"
          variant="solid"
          @click="emit('openModal', currentNode.id)"
        >
          新增動畫<UKbd size="sm">W</UKbd>
        </UButton>
        <UButton size="xs" color="gray" icon="i-heroicons-plus-solid" variant="solid">
          新增節點
          <UKbd size="sm">E</UKbd>
        </UButton>
      </div>
    </div>
    <!-- 動畫條操作 -->
    <div
      v-if="currentBarTweenObject"
      class="mt-1 flex flex-col items-start gap-y-2 border-t border-neutral-200 pt-2"
    >
      <div class="flex w-full flex-row items-center justify-start gap-x-2">
        <UButton size="xs" color="primary" variant="solid" @click="updateAnimationBarFromVars"
          >更新初始點<UKbd size="sm">S</UKbd></UButton
        >
        <UButton size="xs" color="primary" variant="solid" @click="updateAnimationBarToVars"
          >更新結尾點<UKbd size="sm">D</UKbd></UButton
        >
        <UButton
          size="xs"
          color="primary"
          variant="solid"
          @click="removeTween(currentBarTweenObject)"
          >刪除tween<UKbd size="sm">D</UKbd></UButton
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
