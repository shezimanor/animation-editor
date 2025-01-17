console.log('exec useGsap');
import type { Node } from 'konva/lib/Node';

const { gsapTimeline, initializedGsap, paused, gsapTimelineNodeTweenMap } = useGlobal();

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

  // test functions
  const logTimeline = (targetNode: Node, barId: string) => {
    if (!gsapTimeline) return null;
    const nodeId = targetNode.id();
    const tweenObj = gsapTimelineNodeTweenMap[nodeId][barId];
    console.log('tweenObj:', tweenObj);
  };

  return {
    // state
    initializedGsap,
    paused,
    gsapTimelineNodeTweenMap,
    // action
    playGsapTimeline,
    pauseGsapTimeline,
    getTimelineDuration,
    logTimeline
  };
};
