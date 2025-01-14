console.log('exec useGlobal2');

const gsapTimeline = ref<GSAPTimeline | null>(null);
const initializedGsap = ref(false);
const paused = ref(true);
const gsapHiddenNode = { x: 0 }; // 用來製作 timeline 固定結尾點的物件
const gsapTimelineNodeMap = ref<Record<string, Record<string, gsap.core.Tween>>>({});

watch(gsapTimeline, () => {
  console.log('watch gsapTimeline');
});

export const useGlobal2 = () => {
  return {
    gsapTimeline,
    initializedGsap,
    paused,
    gsapHiddenNode,
    gsapTimelineNodeMap
  };
};
