console.log('exec useTimeline');
// Konva: https://konvajs.org/api/Konva.html
import { useResizeObserver } from '@vueuse/core';
import Konva from 'konva';

const {
  paused,
  currentTime,
  updateCurrentTime,
  seekGsapTimeline,
  timelineStage,
  timelineLayer,
  gsapTimelineNodeTweenInfoMap,
  inactivateNode
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
    const layer = createLayer();
    layer.on('click', function (event) {
      console.log('timelineLayer Clicked:');
      const targetElement = event.target;
      if (targetElement instanceof Konva.Rect || targetElement instanceof Konva.Circle) {
        const targetId = targetElement.id();
        console.log('targetId: ', targetId);
        if (targetId.indexOf('bar') === -1 && targetId.indexOf('circle') === -1) {
          console.log('ina');
          inactivateNode();
        }
      } else {
        console.log('ina');
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
        barItem.width(
          trackWidth * ((gsapTimelineNodeTweenInfoMap[barId].duration ?? 0) / TOTAL_DURATION)
        );
        barItem.x(trackWidth * (gsapTimelineNodeTweenInfoMap[barId].start / TOTAL_DURATION));
      });
      // 調整所有節點的 x
      const circleItems = timelineLayer.value?.find('.item_circle');
      circleItems?.forEach((circleItem) => {
        const circleId = circleItem.id();
        circleItem.x(trackWidth * (gsapTimelineNodeTweenInfoMap[circleId].start / TOTAL_DURATION));
      });
    });
  };

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
