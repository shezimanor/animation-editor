<!-- 編輯頁：所以工具列在這頁 -->
<script setup lang="ts">
import { getImageData } from '~/utils/konva';
import testImg1 from '~/assets/images/demo/pokedex-0144-1.png';
import testImg2 from '~/assets/images/demo/pokedex-0145-1.png';
import testImg3 from '~/assets/images/demo/pokedex-0146-1.png';

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
    width: 640,
    height: 320,
    mmid: 'test-mmid',
    cmid: 'test-cmid',
    token: 'test-token',
    title: '模組標題'
  })
});

const { mainStageRef, mainStageBgRef, initKonva, destroyKonva, addImage } = useKonva({
  width: adModule.value.width,
  height: adModule.value.height
});

const { timelineStageRef, initTimelineKonva, destroyTimelineKonva } = useTimeline();

const isHidedGridDot = useState('isHidedGridDot', () => false);

const ticks = ref([
  '0',
  "'",
  "'",
  '1.5',
  "'",
  "'",
  '3',
  "'",
  "'",
  '4.5',
  "'",
  "'",
  '6',
  "'",
  "'",
  '7.5',
  "'",
  "'",
  '9',
  "'",
  "'",
  '10.5',
  "'",
  "'",
  '12'
]);

const handleDrop = async (e: DragEvent) => {
  e.stopPropagation();
  e.preventDefault();
  const fileList = e.dataTransfer?.files;
  if (!fileList || fileList.length === 0) return;
  try {
    const imgObjList = await Promise.all(Array.from(fileList).map((file) => getImageData(file)));
    imgObjList.forEach((imgObj) => {
      // 加入圖片至主畫布
      addImage(imgObj);
    });
  } catch {
    throw new Error('Failed to load image data.');
  }
};

const loadImages = async (imageUrls: string[]) => {
  try {
    const imgObjList = await Promise.all(imageUrls.map((url) => getImageDataByUrl(url)));
    imgObjList.forEach((imgObj) => {
      // 加入圖片至主畫布
      addImage(imgObj);
    });
  } catch (error) {
    throw new Error('Failed to load image data.');
  }
};

onMounted(() => {
  initKonva();
  initTimelineKonva();
  // 自動建立測試圖層
  // loadImages([testImg2]);
  loadImages([testImg1, testImg2, testImg3]);
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
      >
        <!-- 時間軸標籤 -->
        <ul
          class="flex w-full flex-row justify-between pl-8 pt-1 text-sm tracking-wide text-neutral-500"
        >
          <li v-for="(tick, index) in ticks" :key="index">
            {{ tick }}
          </li>
        </ul>
        <!-- 模擬時間軸條 -->
        <div class="h-60 w-full">
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
