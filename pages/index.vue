<!-- 編輯頁：所以工具列在這頁 -->
<script setup lang="ts">
import { getImageData } from '~/utils/konva';

export interface AdModuleConfig {
  width: number;
  height: number;
  mmid: string;
  cmid: string;
  token: string;
  title: string;
}

const adModule = useCookie<AdModuleConfig>('adModuleInfo', {
  default: () => ({
    width: 320,
    height: 480,
    mmid: 'test-mmid',
    cmid: 'test-cmid',
    token: 'test-token',
    title: '模組標題'
  })
});

const { mainStageRef, mainStageBgRef, initKonva, destroyKonva, addImage, addRect } = useKonva({
  width: adModule.value.width,
  height: adModule.value.height
});

const { timelineStageRef, initTimelineKonva, destroyTimelineKonva } = useTimeline();

const isHidedGridDot = useState('isHidedGridDot', () => false);

const handleDrop = async (e: DragEvent) => {
  e.stopPropagation();
  e.preventDefault();
  const file = e.dataTransfer?.files[0];

  if (!file) return;
  try {
    const imgObj = await getImageData(file);
    addImage(imgObj);
  } catch {
    throw new Error('Failed to get image data.');
  }
};

onMounted(() => {
  initKonva();
  initTimelineKonva();
});
onUnmounted(() => {
  destroyKonva();
  destroyTimelineKonva();
});
</script>

<template>
  <div class="flex h-full flex-row items-stretch">
    <main class="flex w-full flex-col justify-stretch bg-neutral-200">
      <!-- 編輯器主畫布 -->
      <div class="flex w-full flex-shrink flex-grow items-center justify-center overflow-hidden">
        <div class="main-canvas" @dragover.prevent.stop @dragenter.prevent.stop @drop="handleDrop">
          <div class="main-canvas__bg">
            <div
              ref="mainStageBgRef"
              class="main-canvas__grid-dot-pattern"
              :class="{ hidden: isHidedGridDot }"
            ></div>
          </div>

          <div ref="mainStageRef"></div>
        </div>
      </div>
      <!-- 時間軸畫布 -->
      <div
        class="flex w-full flex-shrink-0 flex-grow-0 flex-col gap-y-2 border-t-2 border-neutral-300 px-4"
        @dragover.prevent.stop
        @dragenter.prevent.stop
        @drop="handleDrop"
      >
        <!-- 時間軸標籤 -->
        <ul
          class="flex w-full flex-row justify-between pt-1 text-sm tracking-wide text-neutral-500"
        >
          <li>0秒</li>
          <li>3秒</li>
          <li>6秒</li>
          <li>9秒</li>
          <li>12秒</li>
        </ul>
        <!-- 模擬時間軸條 -->
        <div class="h-[240px] w-full">
          <div ref="timelineStageRef"></div>
        </div>
      </div>
    </main>
    <AppPanelGroup />
  </div>
</template>

<style scoped lang="scss">
.main-canvas {
  @apply relative h-full w-full;

  &__bg {
    @apply pointer-events-none absolute left-0 top-0 flex h-full w-full items-center justify-center bg-white;
  }

  &__grid-dot-pattern {
    @apply h-full w-full flex-shrink-0 flex-grow-0 bg-repeat;
    background-image: url('~/assets/images/grid-pattern-dot.svg');
    background-size: 16px 16px;
    background-position: center center;
  }
}
</style>
