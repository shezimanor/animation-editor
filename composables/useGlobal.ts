import { type UUIDTypes } from 'uuid';
import Konva from 'konva';

export interface MyNode {
  id: UUIDTypes;
  name: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
}

export const useGlobal = () => {
  console.log('useGlobal');
  // 廣告區域在主畫布的位置(x,y)
  const adModuleX = useState('adModuleX', () => 0);
  const adModuleY = useState('adModuleY', () => 0);

  // 主畫布節點列表(此節點非 Konva 定義的)
  const mainNodeList = useState<MyNode[]>('mainNodeList', () => []);
  // 主畫布節點的 getters
  const mainNodeLength = computed(() => mainNodeList.value.length);
  const mainNodeMap = computed(() =>
    mainNodeList.value.reduce(
      (acc, node) => {
        acc[`${node.id}`] = node;
        return acc;
      },
      {} as Record<string, MyNode>
    )
  );

  // 主畫布 layer
  const mainLayer = useState<Konva.Layer | null>('mainLayer', () => shallowRef(null));
  const updateMainLayer = () => {
    mainLayer.value?.draw();
  };

  // 時間軸畫布 layer
  const timelineLayer = useState<Konva.Layer | null>('timelineLayer', () => shallowRef(null));
  const updateTimelineLayer = () => {
    timelineLayer.value?.draw();
  };

  // 時間軸指針
  const timelinePointer = useState<Konva.Rect | null>('timelinePointer', () => shallowRef(null));
  const isDraggingTimelinePointer = useState('isDraggingTimelinePointer', () => false);
  const updatePointer = (gsapTimeline: GSAPTimeline | null) => {
    if (timelinePointer.value && gsapTimeline && !isDraggingTimelinePointer.value) {
      const progress = gsapTimeline.progress();
      const trackWidth =
        window.innerWidth -
        (ASIDE_WIDTH + TIMELINE_CONTAINER_PADDING_X * 2) -
        TIMELINE_TRACK_START_X;
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

  // gsap
  const gsapTimeline = useState<GSAPTimeline | null>('gsapTimeline', () => shallowRef(null));

  const isOpen_createAnimationModal = useState('isOpen_createAnimationModal', () => false);
  const isOpen_createFlashPointModal = useState('isOpen_createFlashPointModal', () => false);

  const currentNodeId = useState<UUIDTypes | null>('currentNodeId', () => null);
  const currentActiveAnimationId = useState<string | null>('currentActiveAnimationId', () => null);
  const currentActiveFlashPointId = useState<string | null>(
    'currentActiveFlashPointId',
    () => null
  );
  return {
    // 廣告區域在主畫布的位置(x,y)
    adModuleX,
    adModuleY,

    // 主畫布節點資訊(此節點非 Konva 定義的)
    mainNodeList, // state
    mainNodeLength, // getter
    mainNodeMap, // getter

    // 主畫布 layer
    mainLayer, // state
    updateMainLayer, // method

    // 時間軸畫布 layer
    timelineLayer, // state
    updateTimelineLayer, // method

    // 時間軸指針
    timelinePointer, // state
    isDraggingTimelinePointer, // state
    updatePointer, // method
    lockPointer, // method
    unlockPointer, // method

    // gsap
    gsapTimeline, // state

    // 其他
    isOpen_createAnimationModal,
    isOpen_createFlashPointModal,
    currentNodeId,
    currentActiveAnimationId,
    currentActiveFlashPointId
  };
};
