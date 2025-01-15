<!-- 編輯頁：所以工具列在這頁 -->
<script setup lang="ts">
import { Label } from 'konva/lib/shapes/Label';
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
console.log('-index-');
const { mainStageRef, mainStageBgRef, initKonva, destroyKonva, addImage } = useKonva({
  width: adModule.value.width,
  height: adModule.value.height
});

const {
  currentTime,
  paused,
  timelineStageRef,
  initTimelineKonva,
  destroyTimelineKonva,
  updateCurrentTimeByRangeInput
} = useTimeline();

const isHidedGridDot = useState('isHidedGridDot', () => false);

const ticks = ref([
  { label: '|', value: 0 },
  { label: "'", value: 0.5 },
  { label: "'", value: 1 },
  { label: '|', value: 1.5 },
  { label: "'", value: 2 },
  { label: "'", value: 2.5 },
  { label: '|', value: 3 },
  { label: "'", value: 3.5 },
  { label: "'", value: 4 },
  { label: '|', value: 4.5 },
  { label: "'", value: 5 },
  { label: "'", value: 5.5 },
  { label: '|', value: 6 },
  { label: "'", value: 6.5 },
  { label: "'", value: 7 },
  { label: '|', value: 7.5 },
  { label: "'", value: 8 },
  { label: "'", value: 8.5 },
  { label: '|', value: 9 },
  { label: "'", value: 9.5 },
  { label: "'", value: 10 },
  { label: '|', value: 10.5 },
  { label: "'", value: 11 },
  { label: "'", value: 11.5 },
  { label: '|', value: 12 }
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

const handleTimelineChange = (value: string) => {
  const time = parseFloat(value);
  updateCurrentTimeByRangeInput(time);
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
  loadImages([testImg2]);
  // loadImages([testImg1, testImg2, testImg3]);
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
      <div class="relative flex w-full flex-col gap-y-2 border-t-2 border-neutral-300 px-4">
        <UBadge color="white" variant="solid" class="absolute left-1 top-1">{{
          currentTime
        }}</UBadge>
        <!-- 時間軸標籤 -->
        <datalist
          id="tickMarks"
          class="flex w-full flex-row justify-between pl-8 pt-1 text-sm font-bold text-neutral-500"
        >
          <option
            v-for="(tick, index) in ticks"
            :key="index"
            :value="tick.value"
            :label="tick.label"
          />
        </datalist>
        <div class="flex w-full pl-8">
          <!-- TODO: 這邊也可以考慮反過來，控制拉桿讓 tl 暫停，而不是 tl 播放時不能控制拉桿 -->
          <URange
            :min="0"
            :max="12"
            :step="0.001"
            :ui="{
              base: 'disabled:cursor-not-allowed disabled:bg-opacity-100',
              ring: 'focus-visible:ring-0 focus-visible:ring-offset-0',
              progress: {
                base: 'peer-disabled:bg-opacity-100'
              },
              thumb: {
                base: '[&::-webkit-slider-thumb]:-top-[5px] [&::-moz-range-thumb]:-top-[5px]'
              },
              track: {
                base: '[&::-webkit-slider-runnable-track]:group-disabled:bg-opacity-100 [&::-moz-range-track]:group-disabled:bg-opacity-100'
              }
            }"
            :disabled="!paused"
            color="purple"
            size="sm"
            list="tickMarks"
            v-model="currentTime"
            @input="handleTimelineChange($event.target.value)"
          />
        </div>
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
