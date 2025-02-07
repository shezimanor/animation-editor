<script setup lang="ts">
import type { Node } from 'konva/lib/Node';
import { AppBeforeDeleteModal, AppChangeImageModal } from '#components';
type EaseOption = { label: string; value: gsap.EaseString };
// console.log('-panel-');
const modal = useModal();
const {
  mainNodeMap,
  currentTimelineNode,
  currentActiveTimelineNodeId,
  timelineNodeType,
  getTween,
  getTweenEase,
  updateGsapTimelineByTween,
  updateGsapTimelineBySetPoint,
  createTween,
  createSetPoint,
  deleteTween,
  deleteSetPoint
} = useGlobal();
const { updateKonvaNodeAttribute, deleteMainItem } = useKonva();

const props = withDefaults(
  defineProps<{
    node: Node | null;
  }>(),
  {
    node: null
  }
);

const easeList: EaseOption[] = [
  { label: 'None', value: 'none' },
  { label: 'Power1In', value: 'power1.in' },
  { label: 'Power1InOut', value: 'power1.inOut' },
  { label: 'Power1Out', value: 'power1.out' },
  { label: 'Power2In', value: 'power2.in' },
  { label: 'Power2InOut', value: 'power2.inOut' },
  { label: 'Power2Out', value: 'power2.out' },
  { label: 'Power3In', value: 'power3.in' },
  { label: 'Power3InOut', value: 'power3.inOut' },
  { label: 'Power3Out', value: 'power3.out' },
  { label: 'Power4In', value: 'power4.in' },
  { label: 'Power4InOut', value: 'power4.inOut' },
  { label: 'Power4Out', value: 'power4.out' },
  { label: 'BackIn', value: 'back.in' },
  { label: 'BackInOut', value: 'back.inOut' },
  { label: 'BackOut', value: 'back.out' },
  { label: 'BounceIn', value: 'bounce.in' },
  { label: 'BounceInOut', value: 'bounce.inOut' },
  { label: 'BounceOut', value: 'bounce.out' },
  { label: 'CircIn', value: 'circ.in' },
  { label: 'CircInOut', value: 'circ.inOut' },
  { label: 'CircOut', value: 'circ.out' },
  { label: 'ExpoIn', value: 'expo.in' },
  { label: 'ExpoInOut', value: 'expo.inOut' },
  { label: 'ExpoOut', value: 'expo.out' },
  { label: 'SineIn', value: 'sine.in' },
  { label: 'SineInOut', value: 'sine.inOut' },
  { label: 'SineOut', value: 'sine.out' },
  { label: 'ElasticIn', value: 'elastic.in(1,0.2)' },
  { label: 'ElasticInOut', value: 'elastic.inOut(1,0.2)' },
  { label: 'ElasticOut', value: 'elastic.out(1,0.2)' }
];

const easeValue = ref<gsap.EaseString | gsap.EaseFunction>('none');

const currentNode = computed(() => {
  if (!props.node) return null;
  return mainNodeMap.value[props.node.id()];
});

const exactNodeAndTween = computed(() => {
  return (
    currentNode.value && currentActiveTimelineNodeId.value?.indexOf(currentNode.value.id) !== -1
  );
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
// 查看動畫紀錄
const lookTween = () => {
  if (!currentTimelineNode.value || !currentNode.value || !props.node) return;
  const currentTween = getTween(props.node.id(), currentTimelineNode.value.id());
  if (!currentTween) return;
  console.log(currentTween, currentNode.value);
};
// 替換圖片
const openChangeImageModal = (node: Node) => {
  modal.open(AppChangeImageModal, {
    title: '替換圖片',
    content: '將圖片拖曳進來，再按下確認。',
    node: node,
    onSave() {
      // deleteMainItem(node);
      modal.close();
    }
  });
};
// 刪除圖層
const openBeforeDeleteModal = (node: Node) => {
  modal.open(AppBeforeDeleteModal, {
    title: '刪除圖層',
    content: '確定要刪除嗎？刪除後所屬的動畫也會一併刪除，且無法復原。',
    onDelete() {
      deleteMainItem(node);
      modal.close();
    }
  });
};
// 更新 ease
const changeEase = () => {
  console.log('changeEase');
  // console.log('updateAnimationBarToVars');
  if (!currentTimelineNode.value || !currentNode.value || !props.node) return;
  const currentTween = getTween(props.node.id(), currentTimelineNode.value.id());
  if (!currentTween) return;
  updateGsapTimelineByTween(
    currentTween,
    currentTimelineNode.value,
    currentNode.value,
    props.node,
    'ease',
    easeValue.value
  );
};

// 監聽 currentTimelineNode 變化
watch(currentTimelineNode, () => {
  if (!currentTimelineNode.value || !props.node) return;
  const currentEase = getTweenEase(props.node.id(), currentTimelineNode.value.id());
  easeValue.value = currentEase || 'none';
});

onMounted(() => {
  // 初始化 easeValue
  if (!exactNodeAndTween.value || !currentTimelineNode.value || !props.node) {
    easeValue.value = 'none';
  } else {
    const currentEase = getTweenEase(props.node.id(), currentTimelineNode.value.id());
    easeValue.value = currentEase || 'none';
  }
});
</script>

<template>
  <div class="mt-2 flex flex-col gap-y-1 rounded border p-2" v-if="currentNode && node">
    <div class="mb-1 flex items-center justify-between">
      <!-- <h3 class="text-sm font-semibold"></h3> -->
      <div class="flex flex-row gap-x-1">
        <UInput v-model="currentNode.label" size="xs" />
        <UTooltip text="替換圖片" :popper="{ placement: 'bottom' }">
          <UButton
            :square="true"
            class="delete-button"
            icon="i-material-symbols-imagesmode-outline"
            size="xs"
            color="white"
            variant="solid"
            @click="openChangeImageModal(node)"
          />
        </UTooltip>
      </div>
      <UTooltip text="刪除圖層" :popper="{ placement: 'bottom' }">
        <UButton
          :padded="false"
          class="delete-button"
          icon="i-heroicons-x-mark-20-solid"
          size="sm"
          color="red"
          variant="link"
          @click="openBeforeDeleteModal(node)"
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
      v-if="exactNodeAndTween && currentTimelineNode && node"
      class="mt-1 flex flex-col items-start gap-y-2 border-t border-neutral-200 pt-2"
    >
      <div v-if="timelineNodeType === 'bar'" class="flex w-full flex-col gap-y-2">
        <div class="flex flex-row items-center justify-start gap-x-2">
          <UButton size="xs" color="primary" variant="solid" @click="updateAnimationBarFromVars"
            >更新起點</UButton
          >
          <UButton size="xs" color="primary" variant="solid" @click="updateAnimationBarToVars"
            >更新終點</UButton
          >
          <UButton
            size="xs"
            color="rose"
            variant="solid"
            @click="deleteTween(node, currentTimelineNode)"
            >刪除動畫</UButton
          >
          <UButton v-if="false" size="xs" color="gray" variant="solid" @click="lookTween"
            >動畫紀錄</UButton
          >
        </div>
        <div class="flex flex-row items-center justify-between">
          <div class="flex flex-row items-center gap-x-2">
            <UKbd size="md" :ui="{ base: 'text-neutral-500 dark:text-white' }">Ease</UKbd>
            <USelect size="xs" v-model="easeValue" :options="easeList" @change="changeEase" />
          </div>
          <ULink
            class="text-primary text-sm underline"
            to="https://gsap.com/docs/v3/Eases/"
            target="_blank"
          >
            Ease 說明
          </ULink>
        </div>
      </div>
      <div
        v-if="timelineNodeType === 'circle'"
        class="flex w-full flex-row items-center justify-start gap-x-2"
      >
        <UButton size="xs" color="primary" variant="solid" @click="updateAnimationPointVars"
          >更新節點</UButton
        >
        <UButton
          size="xs"
          color="rose"
          variant="solid"
          @click="deleteSetPoint(node, currentTimelineNode)"
          >刪除節點</UButton
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
