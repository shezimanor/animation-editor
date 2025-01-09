import { gsap } from 'gsap';
import type { Node } from 'konva/lib/Node';
interface TweenVars {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  opacity?: number;
  rotation?: number;
  ease?: string;
}

const {
  adModuleX,
  adModuleY,
  mainNodeMap,
  addTimelineBar,
  lockPointer,
  unlockPointer,
  gsapTimeline,
  initializedGsap,
  paused
} = useGlobal();

export const useGsap = () => {
  console.log('useGsap');
  const gsapTimelineNodeMap = useState<Record<string, Record<string, gsap.core.Tween>>>(
    'gsapTimelineNodeMap',
    () => ({})
  );

  const playGsapTimeline = () => {
    gsapTimeline.value?.play();
    paused.value = false;
    // 鎖定時間軸指針
    lockPointer();
  };

  const pauseGsapTimeline = (callback?: Function) => {
    gsapTimeline.value?.pause();
    paused.value = true;
    // 解鎖時間軸指針
    unlockPointer();
    // 更新所有 Konva 節點狀態
    callback && callback();
  };

  const stopGsapTimeline = (callback: Function) => {
    pauseGsapTimeline();
    seekGsapTimeline(0);
    callback && callback();
  };

  const seekGsapTimeline = (progress: number) => {
    gsapTimeline.value?.seek(progress);
  };

  const getTimelineDuration = () => {
    return gsapTimeline.value?.duration() || 0;
  };

  const createAnimation = (targetNode: Node, label: string) => {
    // console.log(gsapTimeline);
    if (!gsapTimeline.value) return 'No timeline found';
    const nodeId = targetNode.id();
    const duration = gsap.utils.random(1, 10, 0.5);
    const start = 0;
    // 先建立時間為 1 秒的空動畫, TODO: start 需要考慮其他因素, duration 也會有相關限制
    const tween = addEmptyTween2(targetNode, duration, start);
    // 加入對應的時間軸動畫條(動畫條 ID 會回傳)
    const barId = addTimelineBar(nodeId, duration, start);
    if (!barId || !tween) return 'Animation failed';
    // 儲存 Tween 到 gsapTimelineNodeMap 裡面
    if (!gsapTimelineNodeMap.value[nodeId]) gsapTimelineNodeMap.value[nodeId] = {};
    gsapTimelineNodeMap.value[nodeId][barId] = tween;
    // TODO: 需要設置一個於 12 秒的結尾點
    // testTlMethods2(gsapTimeline, targetNode);
    return 'Animation created';
  };

  // 建立一個 from,to 狀態相同的不變動畫
  const addEmptyTween = (targetNode: Node, duration: number, start: number) => {
    const id = targetNode.id();
    const targetMainNode = mainNodeMap.value[id]; // 響應式 Node
    if (!targetMainNode) return;
    const { x, y, width, height, opacity, rotation } = targetMainNode;
    const tweenVars = {
      x: x + adModuleX.value,
      y: y + adModuleY.value,
      width,
      height,
      opacity,
      rotation,
      ease: 'none'
    };
    const tween = addTween(targetNode, duration, start, tweenVars, tweenVars);
    return tween;
  };

  // 建立新的 Tween
  const addTween = (
    targetNode: Node,
    duration: number,
    start: number,
    fromVars: TweenVars,
    toVars: TweenVars
  ) => {
    if (!gsapTimeline || !targetNode) return null;
    const tween = gsap.fromTo(
      targetNode,
      { ...fromVars },
      {
        duration,
        ...toVars
      }
    );
    gsapTimeline.value?.add(tween, start);
    return tween;
  };

  // test
  const addEmptyTween2 = (targetNode: Node, duration: number, start: number) => {
    const id = targetNode.id();
    const targetMainNode = mainNodeMap.value[id]; // 響應式 Node
    if (!targetMainNode) return;
    const { x, y, width, height, opacity, rotation } = targetMainNode;
    const tweenVars = {
      x: x + adModuleX.value,
      y: y + adModuleY.value,
      width,
      height,
      opacity,
      rotation,
      ease: 'none'
    };
    const tween = addTween2(targetNode, duration, start, tweenVars, tweenVars);
    return tween;
  };

  // test
  const addTween2 = (
    targetNode: Node,
    duration: number,
    start: number,
    fromVars: TweenVars,
    toVars: TweenVars
  ) => {
    if (!gsapTimeline || !targetNode) return null;
    const newX = targetNode.x() + gsap.utils.random(-800, 800, 5);
    const newY = targetNode.y() + gsap.utils.random(-800, 800, 5);
    const newRotation = gsap.utils.random(-1800, 1800, 5);
    const newOpacity = gsap.utils.random(0, 1, 0.1);
    const tween = gsap.fromTo(
      targetNode,
      { ...fromVars },
      {
        duration,
        ...toVars,
        x: newX,
        y: newY,
        rotation: newRotation,
        opacity: newOpacity
      }
    );
    gsapTimeline.value?.add(tween, start);
    // 設置一個結尾點，讓 timescale 維持 1（每次有新動畫就要更新）
    gsapTimeline.value?.set(
      targetNode,
      { ...toVars, x: newX, y: newY, rotation: newRotation, opacity: newOpacity },
      12
    );
    return tween;
  };

  // 更新動畫條的起始狀態
  // TODO:更新過程:
  const updateFromVars = (targetNode: Node, barId: string, fromVars: TweenVars) => {
    if (!gsapTimeline.value) return null;
  };

  // 更新動畫條的結尾狀態
  // TODO:更新過程:更新過程:
  const updateToVars = (targetNode: Node, barId: string, toVars: TweenVars) => {
    if (!gsapTimeline.value) return null;
  };

  // test functions
  const logTimeline = (targetNode: Node, barId: string) => {
    if (!gsapTimeline.value) return null;
    const nodeId = targetNode.id();
    const tweenObj = gsapTimelineNodeMap.value[nodeId][barId];
    console.log('tweenObj:', (tweenObj.vars.x = 200));
  };

  return {
    // state
    initializedGsap,
    paused,
    // action
    createAnimation,
    playGsapTimeline,
    pauseGsapTimeline,
    seekGsapTimeline,
    stopGsapTimeline,
    getTimelineDuration,
    logTimeline
  };
};
