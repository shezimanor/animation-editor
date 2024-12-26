import { gsap } from 'gsap';

export const useGsap = () => {
  let gsapTimeline: gsap.core.Timeline | null = null;
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
    return gsapTimeline;
  };

  const getGsapTimeline = () => {
    return gsapTimeline;
  };

  const playGsapTimeline = () => {
    getGsapTimeline()?.play();
    paused.value = false;
  };

  const pauseGsapTimeline = () => {
    getGsapTimeline()?.pause();
    paused.value = true;
  };

  const stopGsapTimeline = () => {
    getGsapTimeline()?.pause();
    seekGsapTimeline(0);
    paused.value = true;
  };

  const seekGsapTimeline = (progress: number) => {
    getGsapTimeline()?.seek(progress);
  };

  const getTimelineDuration = () => {
    return getGsapTimeline()?.duration() || 0;
  };

  return {
    createGsapTimeline,
    getGsapTimeline,
    playGsapTimeline,
    pauseGsapTimeline,
    seekGsapTimeline,
    stopGsapTimeline,
    initializedGsap,
    paused,
    getTimelineDuration
  };
};
