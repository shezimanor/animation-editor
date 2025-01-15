import Konva from 'konva';

const { addRect, seekGsapTimeline } = useGlobal();
const TIMELINE_POINTER_WIDTH = 3;
const TIMELINE_POINTER_COLOR = 'rgba(129, 141, 248, 0.8)'; // '#818cf8'

export const usePointer = () => {
  // 時間軸指針
  const timelinePointer = useState<Konva.Rect | null>('timelinePointer', () => shallowRef(null));
  const isDraggingTimelinePointer = useState('isDraggingTimelinePointer', () => false);
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
        const timelineStageWidth = window.innerWidth - TIMELINE_TRACK_WIDTH_SUBTRACTION;
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
      seekGsapTimelineByPointerPosition(this.x());
    });
    pointer.on('dragstart', function () {
      isDraggingTimelinePointer.value = true;
    });
    pointer.on('dragend', function () {
      isDraggingTimelinePointer.value = false;
    });
    timelinePointer.value = pointer;

    return pointer;
  };
  const updatePointer = (gsapTimeline: GSAPTimeline | null) => {
    if (timelinePointer.value && gsapTimeline && !isDraggingTimelinePointer.value) {
      const progress = gsapTimeline.progress();
      const trackWidth =
        window.innerWidth - TIMELINE_TRACK_WIDTH_SUBTRACTION - TIMELINE_TRACK_START_X;
      timelinePointer.value.x(trackWidth * progress + TIMELINE_TRACK_START_X);
      // console.log('progress:', progress);
    }
  };
  const lockPointer = () => {
    timelinePointer.value?.draggable(false);
  };
  const unlockPointer = () => {
    timelinePointer.value?.draggable(true);
  };
  const movePointer = (x: number) => {
    // 移動 pointer
    timelinePointer.value?.x(x + TIMELINE_TRACK_START_X);
    // 更新 gsap 時間軸
    seekGsapTimelineByPointerPosition(x);
  };
  const getTimeByX = (x: number) => {
    // TODO:如果要用的話還需要檢查一下算法
    let time =
      Math.round(
        ((x - TIMELINE_TRACK_START_X) /
          (window.innerWidth - TIMELINE_TRACK_WIDTH_SUBTRACTION - TIMELINE_TRACK_START_X)) *
          TOTAL_DURATION *
          1000
      ) / 1000;
    return time < 0 ? 0 : time;
  };
  const seekGsapTimelineByPointerPosition = (x: number) => {
    const currentTime = getTimeByX(x);
    // 更新 gsap 時間軸
    seekGsapTimeline(currentTime);
  };

  return {
    timelinePointer,
    isDraggingTimelinePointer,
    createPointer,
    updatePointer,
    lockPointer,
    unlockPointer,
    movePointer,
    getTimeByX,
    seekGsapTimelineByPointerPosition
  };
};
