<script setup lang="ts">
import type { Node } from 'konva/lib/Node';
// console.log('-panel-');
const {
  mainNodeMap,
  currentTimelineNode,
  timelineNodeType,
  getTween,
  updateGsapTimelineByTween,
  updateGsapTimelineBySetPoint,
  createTween,
  createSetPoint,
  deleteTween,
  deleteSetPoint
} = useGlobal();
const { updateKonvaNodeAttribute } = useKonva();

const props = withDefaults(
  defineProps<{
    node: Node | null;
  }>(),
  {
    node: null
  }
);

const currentNode = computed(() => {
  if (!props.node) return null;
  return mainNodeMap.value[props.node.id()];
});

const updateKonvaNode = (attrName: string, newValue: number) => {
  if (!currentNode.value || !props.node) return;
  updateKonvaNodeAttribute(props.node, attrName, newValue);
};
// 更新起點
const updateAnimationBarFromVars = () => {
  // console.log('updateAnimationBarFromVars');
  if (!currentTimelineNode.value || !currentNode.value || !props.node) return;
  const currentTween = getTween(props.node.id(), currentTimelineNode.value.id());
  if (!currentTween) return;
  updateGsapTimelineByTween(
    currentTween,
    currentTimelineNode.value,
    currentNode.value,
    props.node,
    'fromVars'
  );
};
// 更新終點
const updateAnimationBarToVars = () => {
  // console.log('updateAnimationBarToVars');
  if (!currentTimelineNode.value || !currentNode.value || !props.node) return;
  const currentTween = getTween(props.node.id(), currentTimelineNode.value.id());
  if (!currentTween) return;
  updateGsapTimelineByTween(
    currentTween,
    currentTimelineNode.value,
    currentNode.value,
    props.node,
    'toVars'
  );
};
// 更新節點
const updateAnimationPointVars = () => {
  // console.log('updateAnimationPointVars');
  if (!currentTimelineNode.value || !currentNode.value || !props.node) return;
  const currentTween = getTween(props.node.id(), currentTimelineNode.value.id());
  if (!currentTween) return;
  updateGsapTimelineBySetPoint(
    currentTween,
    currentTimelineNode.value,
    currentNode.value,
    props.node,
    'vars'
  );
};
const lookTween = () => {
  if (!currentTimelineNode.value || !currentNode.value || !props.node) return;
  const currentTween = getTween(props.node.id(), currentTimelineNode.value.id());
  if (!currentTween) return;
  console.log(currentTween);
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
        <AppQuickInput
          v-model="currentNode.width"
          @change="updateKonvaNode('width', $event)"
          :readonly="true"
        />
      </div>
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">Height</UKbd>
        <AppQuickInput
          v-model="currentNode.height"
          @change="updateKonvaNode('height', $event)"
          :readonly="true"
        />
      </div>
    </div>
    <div class="grid grid-cols-2 gap-x-2">
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">scaleX</UKbd>
        <AppQuickInput v-model="currentNode.scaleX" @change="updateKonvaNode('scaleX', $event)" />
      </div>
      <div class="flex items-center justify-between">
        <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">scaleY</UKbd>
        <AppQuickInput v-model="currentNode.scaleY" @change="updateKonvaNode('scaleY', $event)" />
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
    <div
      v-if="node"
      class="mt-1 flex flex-col items-start gap-y-2 border-t border-neutral-200 pt-2"
    >
      <div class="flex w-full flex-row items-center justify-start gap-x-2">
        <UButton
          size="xs"
          color="gray"
          icon="i-heroicons-plus-solid"
          variant="solid"
          @click="createTween(node)"
        >
          新增動畫<UKbd size="xs">W</UKbd>
        </UButton>
        <UButton
          size="xs"
          color="gray"
          icon="i-heroicons-plus-solid"
          variant="solid"
          @click="createSetPoint(node)"
        >
          新增節點
          <UKbd size="xs">E</UKbd>
        </UButton>
      </div>
    </div>
    <!-- 動畫條操作 -->
    <div
      v-if="currentTimelineNode && node"
      class="mt-1 flex flex-col items-start gap-y-2 border-t border-neutral-200 pt-2"
    >
      <div
        v-if="timelineNodeType === 'bar'"
        class="flex w-full flex-row items-center justify-start gap-x-2"
      >
        <UButton size="xs" color="primary" variant="solid" @click="updateAnimationBarFromVars"
          >更新起點<UKbd size="xs">S</UKbd></UButton
        >
        <UButton size="xs" color="primary" variant="solid" @click="updateAnimationBarToVars"
          >更新終點<UKbd size="xs">D</UKbd></UButton
        >
        <UButton
          size="xs"
          color="rose"
          variant="solid"
          @click="deleteTween(node, currentTimelineNode)"
          >刪除動畫<UKbd size="xs">⌫</UKbd></UButton
        >
        <UButton v-if="false" size="xs" color="gray" variant="solid" @click="lookTween"
          >動畫紀錄</UButton
        >
      </div>
      <div
        v-if="timelineNodeType === 'circle'"
        class="flex w-full flex-row items-center justify-start gap-x-2"
      >
        <UButton size="xs" color="primary" variant="solid" @click="updateAnimationPointVars"
          >更新節點<UKbd size="xs">S</UKbd></UButton
        >
        <UButton
          size="xs"
          color="rose"
          variant="solid"
          @click="deleteSetPoint(node, currentTimelineNode)"
          >刪除節點<UKbd size="xs">⌫</UKbd></UButton
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
