<!-- 編輯頁：所以工具列在這頁 -->
<script setup lang="ts">
const containerWidth = ref(640);
const containerHeight = ref(480);

const { currentToolId } = useTool();
const { mainStageRef, addImage, addRect } = useKonva(true, {
  width: containerWidth.value,
  height: containerHeight.value
});
</script>

<template>
  <div class="flex h-full flex-row items-stretch">
    <ToolMainNav />
    <ToolPanel v-show="currentToolId" />
    <main class="flex w-full flex-col justify-stretch bg-neutral-200">
      <!-- 編輯器主畫布 -->
      <div class="flex w-full flex-shrink flex-grow items-center justify-center">
        <div class="bg-white"><div ref="mainStageRef"></div></div>
      </div>
      <!-- 時間軸畫布 -->
      <div class="flex h-[160px] w-full flex-col gap-y-2 border-t-2 border-neutral-300 px-4">
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

<style scoped lang="scss"></style>
