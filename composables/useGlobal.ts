import Konva from 'konva';
import { gsap } from 'gsap';
import type { NodeConfig } from 'konva/lib/Node';
import type { ImageConfig } from 'konva/lib/shapes/Image';
import type { GroupConfig } from 'konva/lib/Group';
console.log('exec useGlobal');

export interface MyNode {
  id: string;
  name: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
}

const paused = ref(true);
let gsapTimeline = gsap.timeline({
  repeat: -1,
  paused: paused.value,
  onStart() {
    paused.value = false;
  },
  onComplete() {
    paused.value = true;
  }
});
const gsapHiddenNode = { x: 0 }; // 用來製作 timeline 固定結尾點的物件
const initializedGsap = ref(false);
const currentTime = ref(0);
const gsapTimelineNodeTweenMap: Record<string, Record<string, GSAPTween>> = {};

export const useGlobal = () => {
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

  // 主畫布物件
  const mainContainer = useState<HTMLDivElement | null>('mainContainer', () => shallowRef(null));
  const mainSelectionRect = useState<Konva.Rect | null>('mainSelectionRect', () =>
    shallowRef(null)
  );
  const mainTransformer = useState<Konva.Transformer | null>('mainTransformer', () => null); // 需要偵測他的 nodes 數量，所以不能用 shallowRef
  const getTargetNodeFromMain = (id: string) => {
    return mainLayer.value?.findOne(`#${id}`);
  };
  const selectTargetNodeFromMain = (id: string) => {
    const targetNode = getTargetNodeFromMain(id) as Konva.Image;
    if (targetNode) focusOnItem(targetNode);
  };
  const focusOnItem = (item: Konva.Shape | Konva.Group | Konva.Image) => {
    mainLayer.value?.add(item);
    mainTransformer.value?.nodes([item]);
    // 把變形器移到最上面
    mainTransformer.value?.moveToTop();
    // 把選取框移到最上面
    mainSelectionRect.value?.moveToTop();
    // focus on mainContainer(可以使用鍵盤事件)
    mainContainer.value?.focus();
  };

  // 時間軸畫布 stage, layer
  const timelineStage = useState<Konva.Stage | null>('timelineStage', () => shallowRef(null));
  const timelineLayer = useState<Konva.Layer | null>('timelineLayer', () => shallowRef(null));
  const timelineTransformers = useState<Konva.Transformer[]>('timelineTransformers', () => []);
  const timelineItemInitialY = ref(0);
  const getTargetNodeFromTimeline = (id: string) => {
    return timelineLayer.value?.findOne(`#${id}`);
  };
  const updateTimelineLayer = () => {
    timelineLayer.value?.draw();
  };
  const addRect = (rectConfig: Partial<NodeConfig>) => {
    return new Konva.Rect(rectConfig);
  };
  const addImage = (imageConfig: ImageConfig) => {
    return new Konva.Image(imageConfig);
  };
  const addGroup = (groupConfig: GroupConfig) => {
    return new Konva.Group(groupConfig);
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
        if (newBox.x + newBox.width > window.innerWidth - TIMELINE_TRACK_WIDTH_SUBTRACTION) {
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
    timelineLayer.value?.add(newTransformer);
    timelineTransformers.value.push(newTransformer);
    return newTransformer;
  };
  // 更新起始位置 (用 track 來找)
  const updateTimelineTrackInitialPosition = () => {
    const tracks = timelineLayer.value?.find('.item_track') ?? [];
    timelineItemInitialY.value = tracks.length * (TIMELINE_TRACK_HEIGHT + TIMELINE_TRACK_GAP_Y);
  };
  // 隱藏空的變形器
  const hideEmptyTransformer = (id: string) => {
    // console.log('hideEmptyTransformer', timelineTransformers.value);
    for (let i = 0; i < timelineTransformers.value.length; i++) {
      const transformer = timelineTransformers.value[i];
      // 依據 function `addTimelineBar` 邏輯 transformer nodes 會長這樣: transformer.nodes([barItem])
      const barItems = transformer.nodes();
      if (barItems.length > 0 && barItems[0].id().endsWith(`${id}`)) {
        transformer.visible(false);
        transformer.nodes([]);
      }
    }
  };
  // 更新相同類型物件的位置
  const updateTimelineAllItems = (selectorName: string) => {
    const items = timelineLayer.value?.find(selectorName) ?? [];
    items.forEach((item, index) => {
      item.y(index * (TIMELINE_TRACK_HEIGHT + TIMELINE_TRACK_GAP_Y));
    });
  };
  const addTimelineTrack = (imgObj: HTMLImageElement, itemId: string) => {
    // 只用來放置整個軌道的動畫條群組
    const groupItem = addGroup({
      id: `group_${itemId}`,
      name: 'item_bar_group',
      x: TIMELINE_TRACK_START_X,
      y: timelineItemInitialY.value,
      draggable: false
    });

    // 圖示
    const imgItem = addImage({
      id: `img_${itemId}`,
      name: 'item_img',
      x: 0,
      y: timelineItemInitialY.value,
      image: imgObj,
      width: TIMELINE_TRACK_HEIGHT,
      height: TIMELINE_TRACK_HEIGHT,
      fill: 'rgba(255, 255, 255, 1)',
      cornerRadius: 2,
      draggable: false
    });

    imgItem.on('click', function () {
      // 點擊圖片可以選取到主畫布的素材
      selectTargetNodeFromMain(itemId);
    });

    imgItem.on('mouseenter', function () {
      imgItem.opacity(0.6);
      if (timelineStage.value) timelineStage.value.container().style.cursor = 'pointer';
    });

    imgItem.on('mouseleave mouseout', function () {
      imgItem.opacity(1);
      if (timelineStage.value) timelineStage.value.container().style.cursor = 'default';
    });

    // 時間軸軌道背景
    const trackItem = addRect({
      id: `track_${itemId}`,
      name: 'item_track',
      x: TIMELINE_TRACK_START_X,
      y: timelineItemInitialY.value,
      width: window.innerWidth - TIMELINE_TRACK_WIDTH_SUBTRACTION - TIMELINE_TRACK_START_X,
      height: TIMELINE_TRACK_HEIGHT,
      fill: 'rgba(255, 255, 255, 0.6)',
      cornerRadius: 2,
      draggable: false
    });

    timelineLayer.value?.add(imgItem);
    timelineLayer.value?.add(trackItem);
    timelineLayer.value?.add(groupItem);
    // 更新起始位置
    updateTimelineTrackInitialPosition();
  };
  const deleteTimelineTrack = (id: string) => {
    // 隱藏空的變形器
    hideEmptyTransformer(id);
    const imgItem = getTargetNodeFromTimeline(`img_${id}`);
    if (imgItem && imgItem instanceof Konva.Image) {
      // 刪除 Img
      imgItem.destroy();
      // 更新所有 Img 的位置
      updateTimelineAllItems('.item_img');
    }
    const trackItem = getTargetNodeFromTimeline(`track_${id}`);
    if (trackItem && trackItem instanceof Konva.Rect) {
      // 刪除 Track
      trackItem.destroy();
      // 更新所有 Track 的位置
      updateTimelineAllItems('.item_track');
    }
    const groupItem = getTargetNodeFromTimeline(`group_${id}`);
    if (groupItem && groupItem instanceof Konva.Group) {
      // 刪除 Bar Group
      groupItem.destroy();
      // 更新所有 Bar Group 的位置
      updateTimelineAllItems('.item_bar_group');
    }
    // 更新起始位置
    updateTimelineTrackInitialPosition();
  };
  // 顯目當前動畫條
  const activateBar = (sourceId: string, barId: string, barItem: Konva.Rect) => {
    // highlight active bar
    inactivateBar();
    barItem.fill(TIMELINE_BAR_ACTIVE_COLOR);
    barItem.name('item_bar item_bar_active');
    // 設定 currentActiveBarId
    currentActiveBarId.value = barId;
    // 選取到主畫布的素材
    selectTargetNodeFromMain(sourceId);
  };
  // 移除動畫條的顯目顯示
  const inactivateBar = () => {
    const activeBar = timelineLayer.value?.findOne('.item_bar_active');
    if (activeBar && activeBar instanceof Konva.Rect) {
      activeBar.fill(TIMELINE_BAR_COLOR);
      activeBar.name('item_bar');
    }
  };

  // gsap
  const updateCurrentTime = (time: number) => {
    currentTime.value = time;
  };
  const seekGsapTimeline = (time: number) => {
    gsapTimeline?.seek(time);
  };
  const logGsapTimeline = () => {
    console.log('gsapTimeline: ', gsapTimeline);
    console.log('duration: ', gsapTimeline?.duration());
  };

  const createGsapTimeline = () => {
    // 設定 onUpdate
    gsapTimeline.eventCallback('onUpdate', () => {
      console.log('onUpdate');
      // 更新 currentTime
      const time = gsapTimeline.time();
      currentTime.value = time;
      // 更新主畫布
      updateMainLayer();
      updateTimelineLayer();
    });
    // 設置一個結尾點，讓 timescale 維持 1（每次有新動畫就要更新）
    // 自定義 gsap 時間軸的結尾
    gsapTimeline?.set(gsapHiddenNode, { x: 0 }, 12);
    initializedGsap.value = true;
  };

  // modal control
  const isOpen_createTweenModal = useState('isOpen_createTweenModal', () => false);
  const isOpen_createFlashPointModal = useState('isOpen_createFlashPointModal', () => false);
  // current id
  const currentNodeId = useState<string | null>('currentNodeId', () => null);
  const currentActiveBarId = useState<string | null>('currentActiveBarId', () => null);
  const currentActiveFlashPointId = useState<string | null>(
    'currentActiveFlashPointId',
    () => null
  );
  // edit animation control
  const isEditStartPoint = useState('isEditStartPoint', () => false);
  const isEditEndPoint = useState('isEditEndPoint', () => false);

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

    // 主畫布物件
    mainContainer, // state
    mainSelectionRect, // state
    mainTransformer, // state
    getTargetNodeFromMain, // method
    selectTargetNodeFromMain, // method
    focusOnItem, // method

    // 時間軸畫布 stage, layer
    timelineStage, // state
    timelineLayer, // state
    getTargetNodeFromTimeline, // method
    updateTimelineLayer, // method

    // 時間軸物件
    timelineTransformers, // state
    addTimelineTrack, // method
    deleteTimelineTrack, // method
    activateBar, // method
    inactivateBar, // method
    addRect, // method
    addImage, // method
    addGroup, // method
    addTransformer, // method

    // gsap
    gsapTimeline, // 原生物件
    gsapTimelineNodeTweenMap, // 原生物件
    initializedGsap, // state
    paused, // state
    currentTime, // state
    updateCurrentTime, // method
    seekGsapTimeline,
    logGsapTimeline, // method
    createGsapTimeline, // method

    // modal control
    isOpen_createTweenModal,
    isOpen_createFlashPointModal,
    // current id
    currentNodeId,
    currentActiveBarId,
    currentActiveFlashPointId,
    isEditStartPoint,
    isEditEndPoint
  };
};
