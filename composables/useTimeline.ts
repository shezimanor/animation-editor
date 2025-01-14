console.log('exec useTimeline');
// Konva: https://konvajs.org/api/Konva.html
import { useResizeObserver } from '@vueuse/core';
import Konva from 'konva';

const {
  timelineStage,
  timelineLayer,
  timelinePointer,
  addRect,
  isDraggingTimelinePointer,
  updateGsapTimelineByPointerPosition
} = useGlobal();

export const useTimeline = () => {
  // composable 專用常數
  const TIMELINE_CONTAINER_HEIGHT = 240;
  const TIMELINE_POINTER_WIDTH = 4;
  const TIMELINE_POINTER_COLOR = 'rgba(129, 141, 248, 0.8)'; // '#818cf8'
  // ---
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
    // create Pointer(時間軸的指針)
    createPointer();

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
        width: window.innerWidth - (ASIDE_WIDTH + TIMELINE_CONTAINER_PADDING_X * 2),
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
  };

  const createPointer = () => {
    const pointer = addRect({
      id: `pointer`,
      name: 'item_pointer',
      x: TIMELINE_TRACK_START_X,
      y: 0,
      width: TIMELINE_POINTER_WIDTH,
      height: TIMELINE_CONTAINER_HEIGHT - TIMELINE_POINTER_WIDTH,
      fill: TIMELINE_POINTER_COLOR,
      cornerRadius: 2,
      draggable: true,
      dragBoundFunc(pos) {
        const timelineStageWidth =
          timelineStage.value?.width() ??
          window.innerWidth - (ASIDE_WIDTH + TIMELINE_CONTAINER_PADDING_X * 2);
        return {
          x:
            pos.x < TIMELINE_TRACK_START_X
              ? TIMELINE_TRACK_START_X
              : pos.x + TIMELINE_POINTER_WIDTH > timelineStageWidth
                ? timelineStageWidth - TIMELINE_POINTER_WIDTH
                : pos.x,
          y: this.absolutePosition().y
        };
      }
    });
    // 事件監聽
    pointer.on('dragmove', function () {
      updateGsapTimelineByPointerPosition(this.x());
    });
    pointer.on('dragstart', function () {
      isDraggingTimelinePointer.value = true;
    });
    pointer.on('dragend', function () {
      isDraggingTimelinePointer.value = false;
    });
    timelineLayer.value?.add(pointer);
    pointer.moveToTop();
    timelinePointer.value = pointer;
  };

  return {
    // state
    timelineStageRef,
    // action
    initTimelineKonva,
    destroyTimelineKonva
  };
};
