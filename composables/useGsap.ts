import { gsap } from 'gsap';
import type { Node } from 'konva/lib/Node';
let gsapTimeline: gsap.core.Timeline | null = null;

export const useGsap = () => {
  const initializedGsap = useState('initializedGsap', () => false);
  const paused = useState('paused', () => true);

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

  const createAnimation = (targetNode: Node) => {
    const gsapTimeline = getGsapTimeline();
    console.log(gsapTimeline);
    if (!gsapTimeline) return 'No timeline found';
    gsapTimeline.to(targetNode, { x: targetNode.x() + 50, duration: 1 }, 0);
    gsapTimeline.to(
      targetNode,
      {
        x: targetNode.x() + 50,
        y: targetNode.y() + 50,
        duration: 1
      },
      1
    );
    gsapTimeline.to(
      targetNode,
      {
        rotation: targetNode.rotation() + 360,
        duration: 2
      },
      2
    );
    gsapTimeline.to(
      targetNode,
      {
        scaleX: 3,
        scaleY: 3,
        opacity: 0,
        duration: 2
      },
      4
    );
    return 'Animation created';
  };

  return {
    createGsapTimeline,
    getGsapTimeline,
    createAnimation,
    playGsapTimeline,
    pauseGsapTimeline,
    seekGsapTimeline,
    stopGsapTimeline,
    initializedGsap,
    paused,
    getTimelineDuration
  };
};
