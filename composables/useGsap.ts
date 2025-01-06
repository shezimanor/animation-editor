import { gsap } from 'gsap';
import type { Node } from 'konva/lib/Node';
let gsapTimeline: gsap.core.Timeline | null = null;
const { addTimelineBar } = useTimeline();

export const useGsap = () => {
  const initializedGsap = useState('initializedGsap', () => false);
  const paused = useState('paused', () => true);
  const gsapTimelineNodeMap = useState<Record<string, { duration: number; start: number }[]>>(
    'gsapTimelineNodeMap',
    () => ({})
  );

  const createGsapTimeline = (updateFn: gsap.Callback) => {
    gsapTimeline = gsap.timeline({
      repeat: -1,
      paused: paused.value,
      onUpdate: updateFn,
      onStart: () => {
        paused.value = false;
      },
      onComplete: () => {
        paused.value = true;
      }
    });
    initializedGsap.value = true;
  };

  const getGsapTimeline = () => {
    return gsapTimeline;
  };

  const playGsapTimeline = () => {
    getGsapTimeline()?.play();
    paused.value = false;
  };

  const pauseGsapTimeline = (callback?: Function) => {
    getGsapTimeline()?.pause();
    paused.value = true;
    // 更新所有 Konva 節點狀態
    callback && callback();
  };

  const stopGsapTimeline = (callback: Function) => {
    pauseGsapTimeline();
    seekGsapTimeline(0);
    callback && callback();
  };

  const seekGsapTimeline = (progress: number) => {
    getGsapTimeline()?.seek(progress);
  };

  const getTimelineDuration = () => {
    return getGsapTimeline()?.duration() || 0;
  };

  const createAnimation = (targetNode: Node | undefined, label: string) => {
    const gsapTimeline = getGsapTimeline();
    // console.log(gsapTimeline);
    if (!gsapTimeline) return 'No timeline found';
    if (!targetNode) return 'No targetNode found';
    const id = targetNode.id();
    // 先建立時間為 1 秒的空動畫, 起始點需要考慮其他因素
    gsapTimeline.to(
      targetNode,
      {
        ease: 'none',
        duration: 1
      },
      0 // 起始點
    );
    addTimelineBar(id);
    // 加入 Node 的時間軸資料
    gsapTimelineNodeMap.value[id] = [{ duration: 1, start: 0 }];
    return 'Animation created';
  };

  return {
    // state
    initializedGsap,
    paused,
    // action
    createGsapTimeline,
    getGsapTimeline,
    createAnimation,
    playGsapTimeline,
    pauseGsapTimeline,
    seekGsapTimeline,
    stopGsapTimeline,
    getTimelineDuration
  };
};
