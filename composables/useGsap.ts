import { gsap } from 'gsap';
import type { Node } from 'konva/lib/Node';
interface TweenVars {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  opacity?: number;
  rotation?: number;
}

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
      repeat: 1,
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
    addEmptyTween(targetNode, 1, 0);
    addTimelineBar(id);
    // 加入 Node 的時間軸資料
    gsapTimelineNodeMap.value[id] = [{ duration: 1, start: 0 }];
    // TEST
    // testTlMethods2(gsapTimeline, targetNode);
    return 'Animation created';
  };

  const addEmptyTween = (targetNode: Node, duration: number, start: number) => {
    const id = targetNode.id();
    const { mainNodeMap } = useKonva();
    const targetMainNode = mainNodeMap.value[id]; // 響應式 Node
    if (!targetMainNode) return;
    const { x, y, width, height, opacity, rotation } = targetMainNode;
    const tweenVars = { x, y, width, height, opacity, rotation };
    addTween(targetNode, duration, start, tweenVars, tweenVars);
  };

  const addTween = (
    targetNode: Node,
    duration: number,
    start: number,
    fromVars: TweenVars,
    toVars: TweenVars
  ) => {
    const gsapTimeline = getGsapTimeline();
    if (!gsapTimeline || !targetNode) return;
    const tween = gsap.fromTo(targetNode, fromVars, { duration, ...toVars });
    gsapTimeline.add(tween, start);
  };

  const testTlMethods = (gsapTimeline: gsap.core.Timeline, targetNode: Node) => {
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
    console.log(gsapTimeline.time());
  };

  const testTlMethods2 = (gsapTimeline: gsap.core.Timeline, targetNode: Node) => {
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
