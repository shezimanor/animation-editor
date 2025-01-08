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

const { TOTAL_DURATION } = useGlobal();
let gsapTimeline: GSAPTimeline | null = null;

export const useGsap = () => {
  const initializedGsap = useState('initializedGsap', () => false);
  const paused = useState('paused', () => true);
  const gsapTimelineNodeMap = useState<Record<string, Record<string, gsap.core.Tween>>>(
    'gsapTimelineNodeMap',
    () => ({})
  );

  const createGsapTimeline = () => {
    const { updateLayer } = useKonva();
    const { updateTimelineLayer, updatePointer } = useTimeline();

    gsapTimeline = gsap.timeline({
      repeat: -1,
      paused: paused.value,
      duration: TOTAL_DURATION, // 預設時間 12 秒
      ease: 'none',
      onUpdate() {
        updateLayer();
        updatePointer(gsapTimeline);
        updateTimelineLayer();
      },
      onStart() {
        paused.value = false;
      },
      onComplete() {
        paused.value = true;
      }
    });
    // 給定預設時間12秒
    initializedGsap.value = true;
  };

  const getGsapTimeline = () => {
    return gsapTimeline;
  };

  const playGsapTimeline = () => {
    const { lockPointer } = useTimeline();
    getGsapTimeline()?.play();
    paused.value = false;
    // 鎖定時間軸指針
    lockPointer();
  };

  const pauseGsapTimeline = (callback?: Function) => {
    const { unlockPointer } = useTimeline();

    getGsapTimeline()?.pause();
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
    getGsapTimeline()?.seek(progress);
  };

  const getTimelineDuration = () => {
    return getGsapTimeline()?.duration() || 0;
  };

  const createAnimation = (targetNode: Node, label: string) => {
    const { addTimelineBar } = useTimeline();
    const gsapTimeline = getGsapTimeline();
    // console.log(gsapTimeline);
    if (!gsapTimeline) return 'No timeline found';
    const nodeId = targetNode.id();
    const duration = gsap.utils.random(1, 8, 1);
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
    const { adModuleX, adModuleY, mainNodeMap } = useKonva();
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
    const gsapTimeline = getGsapTimeline();
    if (!gsapTimeline || !targetNode) return null;
    const tween = gsap.fromTo(
      targetNode,
      { ...fromVars },
      {
        duration,
        ...toVars
      }
    );
    gsapTimeline.add(tween, start);
    return tween;
  };

  // test
  const addEmptyTween2 = (targetNode: Node, duration: number, start: number) => {
    const { adModuleX, adModuleY, mainNodeMap } = useKonva();
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
    const gsapTimeline = getGsapTimeline();
    if (!gsapTimeline || !targetNode) return null;
    const newX = targetNode.x() + gsap.utils.random(-200, 200, 5);
    const newY = targetNode.y() + gsap.utils.random(-200, 200, 5);
    const tween = gsap.fromTo(
      targetNode,
      { ...fromVars },
      {
        duration,
        ...toVars,
        x: newX,
        y: newY
      }
    );
    gsapTimeline.add(tween, start);
    // 設置一個結尾點，讓 timescale 維持 1（每次有新動畫就要更新）
    gsapTimeline.set(targetNode, { ...toVars, x: newX, y: newY }, 12);
    return tween;
  };

  // 更新動畫條的起始狀態
  // 更新過程:
  const updateFromVars = (targetNode: Node, barId: string, fromVars: TweenVars) => {
    const gsapTimeline = getGsapTimeline();
    if (!gsapTimeline) return null;
  };

  // 更新動畫條的結尾狀態
  // 更新過程:
  const updateToVars = (targetNode: Node, barId: string, toVars: TweenVars) => {
    const gsapTimeline = getGsapTimeline();
    if (!gsapTimeline) return null;
  };

  // test functions
  const logTl = (targetNode: Node, barId: string) => {
    const gsapTimeline = getGsapTimeline();
    if (!gsapTimeline) return null;
    const nodeId = targetNode.id();
    const tweenObj = gsapTimelineNodeMap.value[nodeId][barId];
    console.log('tweenObj:', (tweenObj.vars.x = 200));
    gsapTimeline.restart();
    console.log(gsapTimeline.getChildren());
  };

  // test functions
  const testTlMethods = (gsapTimeline: GSAPTimeline, targetNode: Node) => {
    // 這個測試為了確認 gsapTimeline 的方法是如何運作的
    // add 兩段動畫
    const tween1 = gsap.fromTo(
      targetNode,
      { x: targetNode.x(), y: targetNode.y() },
      { duration: 1, x: targetNode.x() + 200, y: targetNode.y() }
    );
    gsapTimeline.add(tween1, 0);
    const tween2 = gsap.fromTo(
      targetNode,
      { x: 333, y: 200 },
      { duration: 2, x: targetNode.x() + 200, y: targetNode.y() + 400 }
    );
    gsapTimeline.add(tween2, 5);
  };

  // test functions
  const testTlMethods2 = (gsapTimeline: GSAPTimeline, targetNode: Node) => {
    // 這個測試為了確認 gsapTimeline 的方法是如何運作的
    // add 兩段動畫後原地瞬間消失
    const tween1 = gsap.fromTo(
      targetNode,
      { x: targetNode.x(), y: targetNode.y() },
      { duration: 1, x: targetNode.x() + 200, y: targetNode.y() }
    );
    gsapTimeline.add(tween1, 0);
    const tween2 = gsap.fromTo(
      targetNode,
      { x: 333, y: 200 },
      { duration: 2, x: targetNode.x() + 200, y: targetNode.y() + 100 }
    );
    gsapTimeline.add(tween2, 2);
    const tween3 = gsap.set(targetNode, { opacity: 0 });
    gsapTimeline.add(tween3, 4);
    console.log(gsapTimeline.time());
  };

  return {
    // state
    initializedGsap,
    paused,
    TOTAL_DURATION,
    // action
    createGsapTimeline,
    getGsapTimeline,
    createAnimation,
    playGsapTimeline,
    pauseGsapTimeline,
    seekGsapTimeline,
    stopGsapTimeline,
    getTimelineDuration,
    logTl
  };
};
