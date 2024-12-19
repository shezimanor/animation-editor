<!-- 編輯頁：所以工具列在這頁 -->
<script setup lang="ts">
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

const { currentToolId } = useTool();
const { mainStageRef, mainStageBgRef, initKonva, destroyKonva, addImage, addRect } = useKonva({
  width: adModule.value.width,
  height: adModule.value.height
});

const isHidedGridDot = useState('isHidedGridDot', () => false);

onMounted(() => {
  initKonva();
});
onUnmounted(() => {
  destroyKonva();
});
</script>

<template>
  <div class="flex h-full flex-row items-stretch">
    <ToolMainNav />
    <ToolPanel v-show="currentToolId" />
    <main class="flex w-full flex-col justify-stretch bg-neutral-200">
      <!-- 編輯器主畫布 -->
      <div class="flex w-full flex-shrink flex-grow items-center justify-center overflow-hidden">
        <div class="main-canvas">
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
        class="flex h-[160px] w-full flex-shrink-0 flex-grow-0 flex-col gap-y-2 border-t-2 border-neutral-300 px-4"
      >
        <!-- 時間軸標籤 -->
        <ul class="flex w-full flex-row justify-between pt-1 tracking-wide text-neutral-500">
          <li>0秒</li>
          <li>3秒</li>
          <li>6秒</li>
          <li>9秒</li>
          <li>12秒</li>
        </ul>
        <!-- 模擬時間軸條 -->
        <div class="w-full pl-2 pr-3.5">
          <div class="h-10 w-full rounded-md border-2 border-blue-300 bg-white"></div>
        </div>
      </div>
    </main>
    <div></div>
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
