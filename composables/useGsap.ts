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
  gsapTimelineNodeTweenMap
} = useGlobal();

export const useGsap = () => {
  const playGsapTimeline = () => {
    gsapTimeline?.play(0);
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
    gsapTimeline?.remove(tween);
  };

  const getTween = (nodeId: string, barId: string) => {
    console.log('getTween');
    return gsapTimelineNodeTweenMap[nodeId][barId];
  };

  const createTween = (targetNode: Node, label: string) => {
    console.log('createTween');
    const nodeId = targetNode.id();
    const duration = 1;
    const start = 0;
    // 先建立時間為 1 秒的空動畫, TODO: start 需要考慮其他因素, duration 也會有相關限制
    const tween = addEmptyTween(targetNode, duration, start);
    // 加入對應的時間軸動畫條(動畫條 ID 會回傳)
    const barId = addTimelineBar(nodeId, duration, start);
    if (!barId || !tween) return 'Animation failed';
    // 儲存 Tween 到 gsapTimelineNodeTweenMap 裡面
    if (!gsapTimelineNodeTweenMap[nodeId]) gsapTimelineNodeTweenMap[nodeId] = {};
    gsapTimelineNodeTweenMap[nodeId][barId] = tween;

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
      rotation
    };
    const tween = addTween(targetNode, duration, start, tweenVars, {
      ...tweenVars,
      ease: 'none'
    });
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
        immediateRender: false,
        ...toVars
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
    oldTween: GSAPTween,
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
    } = oldTween.vars.startAt as TweenVars;
    const {
      width: toWidth,
      height: toHeight,
      x: toX,
      y: toY,
      rotation: toRotation,
      opacity: toOpacity
    } = oldTween.vars as TweenVars;
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
            opacity: newOpacity
          }
        : {
            width: fromWidth,
            height: fromHeight,
            x: fromX,
            y: fromY,
            rotation: fromRotation,
            opacity: fromOpacity
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
    // console.log('fromVars:', fromVars);
    // console.log('toVars:', toVars);

    const nodeId = targetNode.id();
    const barId = targetBarNode.id();
    // 移除原本的 oldTween
    removeTween(oldTween);
    // 重新建立新的 Tween
    const newTween = addTween(targetNode, 1, 0, fromVars, toVars);

    // 儲存新的 Tween 到 gsapTimelineNodeTweenMap 裡面
    if (newTween) gsapTimelineNodeTweenMap[nodeId][barId] = newTween;

    return 'Animation updated';
  };
  // test functions
  const logTimeline = (targetNode: Node, barId: string) => {
    if (!gsapTimeline) return null;
    const nodeId = targetNode.id();
    const tweenObj = gsapTimelineNodeTweenMap[nodeId][barId];
  };

  return {
    // state
    initializedGsap,
    paused,
    gsapTimelineNodeTweenMap,
    // action
    createTween,
    removeTween,
    getTween,
    playGsapTimeline,
    pauseGsapTimeline,
    getTimelineDuration,
    logTimeline,
    updateGsapTimelineByTween
  };
};
