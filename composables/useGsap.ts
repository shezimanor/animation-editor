console.log('exec useGsap');

import { gsap } from 'gsap';
import type { Node } from 'konva/lib/Node';
import type { MyNode } from './useGlobal';
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
  gsapTimeline,
  adModuleX,
  adModuleY,
  mainNodeMap,
  addTimelineBar,
  initializedGsap,
  paused,
  gsapTimelineNodeMap
} = useGlobal();

export const useGsap = () => {
  const playGsapTimeline = () => {
    gsapTimeline?.play();
    paused.value = false;
  };

  const pauseGsapTimeline = (callback?: Function) => {
    gsapTimeline?.pause();
    paused.value = true;
    // 更新所有 Konva 節點狀態
    callback && callback();
  };

  const getTimelineDuration = () => {
    return gsapTimeline?.duration() || 0;
  };

  const removeTween = (tween: GSAPTween) => {
    console.log('removeTween');
    //
    // gsapTimeline?.killTweensOf(targetNode);
    gsapTimeline?.remove(tween);
    // addEmptyTween(targetNode, 1, 0);
  };

  const createTween = (targetNode: Node, label: string) => {
    // console.log(gsapTimeline);
    if (!gsapTimeline) return 'No timeline found';
    const nodeId = targetNode.id();
    const duration = 1;
    const start = 0;
    // 先建立時間為 1 秒的空動畫, TODO: start 需要考慮其他因素, duration 也會有相關限制
    const tween = addEmptyTween(targetNode, duration, start);
    // 加入對應的時間軸動畫條(動畫條 ID 會回傳)
    const barId = addTimelineBar(nodeId, duration, start);
    if (!barId || !tween) return 'Animation failed';
    // 儲存 Tween 到 gsapTimelineNodeMap 裡面
    if (!gsapTimelineNodeMap[nodeId]) gsapTimelineNodeMap[nodeId] = {};
    gsapTimelineNodeMap[nodeId][barId] = tween;

    return 'Animation created';
  };

  // 建立一個 from,to 狀態相同的不變動畫
  const addEmptyTween = (targetNode: Node, duration: number, start: number) => {
    const id = targetNode.id();
    const targetMainNode = mainNodeMap.value[id]; // 響應式 Node
    if (!targetMainNode) return;
    const { width, height, x, y, rotation, opacity } = targetMainNode;
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
    console.log(duration, start);
    if (!gsapTimeline || !targetNode) return null;
    const tween = gsap.fromTo(
      targetNode,
      { ...fromVars },
      {
        duration,
        ...toVars
        // x: (toVars.x || 0) + 300,
        // y: (toVars.y || 0) + 100
      }
    );
    gsapTimeline?.add(tween, start);
    return tween;
  };

  // 更新動畫條的起始狀態
  // TODO:更新過程:
  const updateFromVars = (targetNode: Node, barId: string, fromVars: TweenVars) => {
    if (!gsapTimeline) return null;
  };

  // 更新動畫條的結尾狀態
  // TODO:更新過程:
  const updateToVars = (targetNode: Node, barId: string, toVars: TweenVars) => {
    if (!gsapTimeline) return null;
  };

  const updateGsapTimelineByTween = (
    tweenObj: GSAPTween,
    targetBarNode: Node,
    targetMainNode: MyNode,
    targetNode: Node,
    updateName: 'fromVars' | 'toVars' | 'duration' | 'startTime'
  ) => {
    if (!gsapTimeline) return;
    const {
      width: fromWidth,
      height: fromHeight,
      x: fromX,
      y: fromY,
      rotation: fromRotation,
      opacity: fromOpacity
    } = tweenObj.vars as TweenVars;
    const {
      width: toWidth,
      height: toHeight,
      x: toX,
      y: toY,
      rotation: toRotation,
      opacity: toOpacity
    } = tweenObj.vars.startAt as TweenVars;
    const {
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY,
      rotation: newRotation,
      opacity: newOpacity
    } = targetMainNode;
    let fromVars =
      updateName === 'fromVars'
        ? {
            width: newWidth,
            height: newHeight,
            x: newX + adModuleX.value,
            y: newY + adModuleY.value,
            rotation: newRotation,
            opacity: newOpacity,
            ease: 'none'
          }
        : {
            width: fromWidth,
            height: fromHeight,
            x: fromX,
            y: fromY,
            rotation: fromRotation,
            opacity: fromOpacity,
            ease: 'none'
          };
    let toVars =
      updateName === 'toVars'
        ? {
            width: newWidth,
            height: newHeight,
            x: newX + adModuleX.value,
            y: newY + adModuleY.value,
            rotation: newRotation,
            opacity: newOpacity,
            ease: 'none'
          }
        : {
            width: toWidth,
            height: toHeight,
            x: toX,
            y: toY,
            rotation: toRotation,
            opacity: toOpacity,
            ease: 'none'
          };
    console.log('toVars:', toVars);

    const nodeId = targetNode.id();
    const barId = targetBarNode.id();
    // 先把 tweenObj 移除
    // gsapTimeline?.killTweensOf(targetNode);
    gsapTimeline?.remove(tweenObj);
    // 重新建立新的 Tween
    const tween = addTween(targetNode, 1, 0, fromVars, toVars);

    // 儲存 Tween 到 gsapTimelineNodeMap 裡面
    if (tween) gsapTimelineNodeMap[nodeId][barId] = tween;

    return 'Animation updated';
  };
  // test functions
  const logTimeline = (targetNode: Node, barId: string) => {
    if (!gsapTimeline) return null;
    const nodeId = targetNode.id();
    const tweenObj = gsapTimelineNodeMap[nodeId][barId];
    console.log('tweenObj:', (tweenObj.vars.x = 200));
  };

  return {
    // state
    initializedGsap,
    paused,
    gsapTimelineNodeMap,
    // action
    createTween,
    removeTween,
    playGsapTimeline,
    pauseGsapTimeline,
    getTimelineDuration,
    logTimeline,
    updateGsapTimelineByTween
  };
};
