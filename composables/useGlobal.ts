import Konva from 'konva';
import { gsap } from 'gsap';
import { v4 as uuid, type UUIDTypes } from 'uuid';
import type { NodeConfig } from 'konva/lib/Node';

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
  const timelineTransformers = useState<Konva.Transformer[]>('timelineTransformers', () => []);
  const updateTimelineLayer = () => {
    timelineLayer.value?.draw();
  };
  const getTargetNodeFromTimeline = (id: string) => {
    return timelineLayer.value?.findOne(`#${id}`);
  };
  const addRect = (rectConfig: Partial<NodeConfig>) => {
    return new Konva.Rect(rectConfig);
  };
  const removeActiveBarHighLight = () => {
    const activeBar = timelineLayer.value?.findOne('.item_bar_active');
    if (activeBar && activeBar instanceof Konva.Rect) {
      activeBar.fill(TIMELINE_BAR_COLOR);
      activeBar.name('item_bar');
    }
  };
  const addTransformer = () => {
    if (timelineTransformers.value.length > 0) {
      const currentTransformer = timelineTransformers.value.find(
        (transformer) => transformer.nodes().length === 0
      );
      // 先開啟 visible 後回傳 Transformer
      if (currentTransformer) {
        currentTransformer.visible(true);
        return currentTransformer;
      }
    }
    // 新增 Transformer
    const newTransformer = new Konva.Transformer({
      borderStroke: 'rgba(255, 255, 255, 0.6)',
      rotateEnabled: false,
      rotateLineVisible: false,
      enabledAnchors: ['middle-left', 'middle-right'],
      visible: true,
      boundBoxFunc(oldBox, newBox) {
        // 限制變形器的範圍
        if (newBox.x < TIMELINE_TRACK_START_X) {
          return oldBox;
        }
        if (
          newBox.x + newBox.width >
          window.innerWidth - (ASIDE_WIDTH + TIMELINE_CONTAINER_PADDING_X * 2)
        ) {
          return oldBox;
        }
        return newBox;
      },
      anchorStyleFunc(anchor) {
        // 左右錨點樣式
        anchor.cornerRadius(3);
        anchor.fill('#a5f3fc');
        anchor.stroke('#67e8f9');
        if (anchor.hasName('middle-left') || anchor.hasName('middle-right')) {
          anchor.height(18);
          anchor.offsetY(9);
          anchor.width(4);
          anchor.offsetX(2);
        }
      }
    });
    // 維持 scaleX = 1, 並將 width 設為原本的 scaleX * width
    newTransformer.on('transform', function () {
      const currentBar = newTransformer.nodes()[0] as Konva.Rect;
      currentBar.width(currentBar.scaleX() * currentBar.width());
      currentBar.scaleX(1);
    });
    timelineLayer.value?.add(newTransformer);
    timelineTransformers.value.push(newTransformer);
    return newTransformer;
  };
  const addTimelineBar = (id: UUIDTypes, duration: number, start: number): string => {
    const groupItem = getTargetNodeFromTimeline(`group_${id}`);
    if (!groupItem || !(groupItem instanceof Konva.Group)) return '';
    const barId = uuid();
    const trackWidth =
      window.innerWidth - (ASIDE_WIDTH + TIMELINE_CONTAINER_PADDING_X * 2) - TIMELINE_TRACK_START_X;
    // 移除其他 bar 的顯目顯示
    removeActiveBarHighLight();
    // 時間軸動畫條(直接醒目顯示)
    const barItem = addRect({
      id: `bar_${barId}_${id}`,
      name: `item_bar item_bar_active`,
      // 這裡的 x,y 位置是相對於 group 的位置
      x: trackWidth * (start / TOTAL_DURATION),
      y: 0,
      width: trackWidth * (duration / TOTAL_DURATION),
      height: TIMELINE_TRACK_HEIGHT,
      fill: TIMELINE_BAR_ACTIVE_COLOR,
      cornerRadius: 3,
      draggable: true,
      dragBoundFunc(pos) {
        const timelineStageWidth =
          window.innerWidth - (ASIDE_WIDTH + TIMELINE_CONTAINER_PADDING_X * 2);
        return {
          x:
            pos.x < TIMELINE_TRACK_START_X
              ? TIMELINE_TRACK_START_X
              : pos.x + this.width() > timelineStageWidth
                ? timelineStageWidth - this.width()
                : pos.x,
          y: this.absolutePosition().y
        };
      }
    });
    // 事件監聽
    barItem.on('click', function () {
      removeActiveBarHighLight();
      barItem.fill(TIMELINE_BAR_ACTIVE_COLOR);
      barItem.name('item_bar item_bar_active');
      // 設定 currentActiveAnimationId
      currentActiveAnimationId.value = barItem.id();
      // 讓 pointer 移到動畫條的起點
      movePointer(barItem.x());
    });
    // 設定 currentActiveAnimationId
    currentActiveAnimationId.value = barId;
    // 加入到 groupItem
    groupItem.add(barItem);
    // 加上變形器
    const transformerItem = addTransformer();
    transformerItem.nodes([barItem]);
    // 將指針推到最上面
    timelinePointer.value?.moveToTop();
    // 回傳 barId
    return barId;
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
  const movePointer = (x: number) => {
    // 移動 pointer
    timelinePointer.value?.x(x + TIMELINE_TRACK_START_X);
    // 更新 gsap 時間軸
    updateGsapTimelineByPointerPosition(x);
  };

  // gsap
  const gsapTimeline = useState<GSAPTimeline | null>('gsapTimeline', () => shallowRef(null));
  const initializedGsap = useState('initializedGsap', () => false);
  const paused = useState('paused', () => true);
  const createGsapTimeline = () => {
    gsapTimeline.value = gsap.timeline({
      repeat: -1,
      paused: paused.value,
      duration: TOTAL_DURATION, // 預設時間 12 秒
      onUpdate() {
        updateMainLayer();
        updatePointer(gsapTimeline.value);
        updateTimelineLayer();
      },
      onStart() {
        paused.value = false;
      },
      onComplete() {
        paused.value = true;
      }
    });
    initializedGsap.value = true;
  };
  const updateGsapTimelineByPointerPosition = (x: number) => {
    if (gsapTimeline.value) {
      const currentTime =
        ((x - TIMELINE_TRACK_START_X) /
          (window.innerWidth -
            (ASIDE_WIDTH + TIMELINE_CONTAINER_PADDING_X * 2) -
            TIMELINE_TRACK_START_X)) *
        TOTAL_DURATION;
      // 更新 gsap 時間軸
      gsapTimeline.value.seek(currentTime);
      // console.log('currentTime:', currentTime);
    }
  };

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
    getTargetNodeFromTimeline, // method

    // 時間軸物件
    timelineTransformers, // state
    addTimelineBar, // method

    // 時間軸指針
    timelinePointer, // state
    isDraggingTimelinePointer, // state
    updatePointer, // method
    lockPointer, // method
    unlockPointer, // method
    movePointer, // method

    // gsap
    gsapTimeline, // state
    initializedGsap, // state
    paused, // state
    createGsapTimeline, // method
    updateGsapTimelineByPointerPosition, // method

    // 其他
    isOpen_createAnimationModal,
    isOpen_createFlashPointModal,
    currentNodeId,
    currentActiveAnimationId,
    currentActiveFlashPointId
  };
};
