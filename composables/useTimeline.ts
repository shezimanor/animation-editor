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
  activateBar,
  inactivateBar
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
      if (targetElement instanceof Konva.Rect) {
        console.log('targetElement:', targetElement.name());
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
