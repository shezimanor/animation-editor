console.log('exec useTimeline');
// Konva: https://konvajs.org/api/Konva.html
import { useResizeObserver, useDebounceFn } from '@vueuse/core';
import Konva from 'konva';
import type { FromToTween, SetPoint } from './useGlobal';

const {
  paused,
  currentTime,
  updateCurrentTime,
  seekGsapTimeline,
  timelineStage,
  timelineLayer,
  gsapTimelineInfoMap,
  inactivateNode,
  gsapTimeline
} = useGlobal();

export const useTimeline = () => {
  const timelineStageRef = useState<HTMLDivElement | null>('timelineStageRef', () =>
    shallowRef(null)
  );
  const timelineContainer = useState<HTMLDivElement | null>('timelineContainer', () =>
    shallowRef(null)
  );

  const initTimelineKonva = () => {
    // create Stage
    createStage();
    // create Layer
    createLayer();
    timelineStage.value?.on('click', function (event) {
      console.log('timelineStage Clicked:');
      const targetElement = event.target;
      if (targetElement instanceof Konva.Rect || targetElement instanceof Konva.Circle) {
        const targetId = targetElement.id();
        if (targetId.indexOf('bar') === -1 && targetId.indexOf('circle') === -1) {
          inactivateNode();
        }
      } else {
        inactivateNode();
      }
    });
    // create Pointer(時間軸的指針)
    // const pointer = createPointer();
    // timelineLayer.value?.add(pointer);

    // 使用 resize 觀察者
    useResizeObserver(timelineStageRef, (entries) => {
      const entry = entries[0];
      // 響應式調整 Stage 寬高
      const { width } = entry.contentRect;
      // 暫停播放器播放
      gsapTimeline?.pause();
      paused.value = true;
      // resizeTimelineStageHandler 是 DebounceFn
      resizeTimelineStageHandler(width);
    });
  };

  const resizeTimelineStageHandler = useDebounceFn((width: number) => {
    timelineStage.value?.width(width);
    const trackWidth =
      window.innerWidth - TIMELINE_TRACK_WIDTH_SUBTRACTION - TIMELINE_TRACK_START_X;
    // 調整軌道長度
    const trackItems = timelineLayer.value?.find('.item_track');
    trackItems?.forEach((trackItem) => {
      trackItem.width(trackWidth);
    });
    // 調整所有動畫條的 x & width
    const barItems = timelineLayer.value?.find('.item_bar');
    barItems?.forEach((barItem) => {
      const barId = barItem.id();
      const nodeId = barId.split('_')[2];
      const tweenInfo = <FromToTween>gsapTimelineInfoMap[nodeId][barId];
      barItem.width(trackWidth * ((tweenInfo.duration ?? 0) / TOTAL_DURATION));
      barItem.x(trackWidth * (tweenInfo.start / TOTAL_DURATION));
    });
    // 調整所有節點的 x
    const circleItems = timelineLayer.value?.find('.item_circle');
    circleItems?.forEach((circleItem) => {
      const circleId = circleItem.id();
      const nodeId = circleId.split('_')[2];
      const setPointInfo = <SetPoint>gsapTimelineInfoMap[nodeId][circleId];
      circleItem.x(trackWidth * (setPointInfo.start / TOTAL_DURATION));
    });
  }, 100);

  // TODO: 清除 Konva
  const destroyTimelineKonva = () => {};

  const createStage = () => {
    if (timelineStageRef.value) {
      timelineStage.value = new Konva.Stage({
        container: timelineStageRef.value,
        width: window.innerWidth - TIMELINE_TRACK_WIDTH_SUBTRACTION,
        height: TIMELINE_CONTAINER_HEIGHT,
        draggable: false
      });
      timelineContainer.value = timelineStage.value.container();
      timelineContainer.value.tabIndex = 1;
      timelineContainer.value.style.outline = 'none';
      timelineContainer.value.style.position = 'relative';
      timelineContainer.value.focus();
    } else {
      throw new Error('timelineStageRef Not Found');
    }
  };

  const createLayer = () => {
    timelineLayer.value = new Konva.Layer();
    timelineStage.value?.add(timelineLayer.value);
    return timelineLayer.value;
  };

  const updateCurrentTimeByRangeInput = (time: number) => {
    updateCurrentTime(time);
    seekGsapTimeline(time);
  };

  return {
    // state
    paused,
    currentTime,
    timelineStageRef,
    // action
    initTimelineKonva,
    destroyTimelineKonva,
    updateCurrentTimeByRangeInput
  };
};
