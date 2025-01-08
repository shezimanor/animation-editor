// Konva: https://konvajs.org/api/Konva.html
import { useResizeObserver } from '@vueuse/core';
import Konva from 'konva';
import type { NodeConfig } from 'konva/lib/Node';
import type { ImageConfig } from 'konva/lib/shapes/Image';
import type { GroupConfig } from 'konva/lib/Group';
import { v4 as uuid, type UUIDTypes } from 'uuid';
const { TOTAL_DURATION, currentActiveAnimationId } = useGlobal();

export const useTimeline = () => {
  // const HEADER_HEIGHT = 56;
  // const FOOTER_HEIGHT = 274;
  const TIMELINE_CONTAINER_HEIGHT = 240;
  const ASIDE_WIDTH = 0;
  const PADDING_X = 16;
  const GAP_Y = 4;
  const TRACK_HEIGHT = 24;
  const POINTER_WIDTH = 4;
  const IMG_MARGIN = 8;
  const POINTER_COLOR = 'rgba(129, 141, 248, 0.8)'; // '#818cf8'
  const BAR_COLOR = '#22d3ee';
  const BAR_ACTIVE_COLOR = '#60a5fa';
  const TRACK_START_X = TRACK_HEIGHT + IMG_MARGIN;
  const timelineStageRef = useState<HTMLDivElement | null>('timelineStageRef', () =>
    shallowRef(null)
  );
  const timelineStage = useState<Konva.Stage | null>('timelineStage', () => shallowRef(null));
  const timelineContainer = useState<HTMLDivElement | null>('timelineContainer', () =>
    shallowRef(null)
  );
  const timelineLayer = useState<Konva.Layer | null>('timelineLayer', () => shallowRef(null));
  const timelinePointer = useState<Konva.Rect | null>('timelinePointer', () => shallowRef(null));
  const timelineTransformers = useState<Konva.Transformer[]>('timelineTransformers', () => []);
  const newItemInitialY = ref(0);
  const isDraggingPointer = ref(false);

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
        width: window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2),
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
      x: TRACK_START_X,
      y: 0,
      width: POINTER_WIDTH,
      height: TIMELINE_CONTAINER_HEIGHT - POINTER_WIDTH,
      fill: POINTER_COLOR,
      cornerRadius: 2,
      draggable: true,
      dragBoundFunc(pos) {
        const timelineStageWidth =
          timelineStage.value?.width() ?? window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2);
        return {
          x:
            pos.x < TRACK_START_X
              ? TRACK_START_X
              : pos.x + POINTER_WIDTH > timelineStageWidth
                ? timelineStageWidth - POINTER_WIDTH
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
      isDraggingPointer.value = true;
    });
    pointer.on('dragend', function () {
      isDraggingPointer.value = false;
    });
    timelineLayer.value?.add(pointer);
    pointer.moveToTop();
    timelinePointer.value = pointer;
  };

  const pointerMoveToTop = () => {
    const pointer = timelineLayer.value?.findOne('.item_pointer');
    pointer?.moveToTop();
  };

  const addTimelineTrack = (imgObj: HTMLImageElement, itemId: string) => {
    const { selectTargetNode } = useKonva();

    // 只用來放置整個軌道的動畫條群組
    const groupItem = addGroup({
      id: `group_${itemId}`,
      name: 'item_bar_group',
      x: TRACK_START_X,
      y: newItemInitialY.value,
      draggable: false
    });

    // 圖示
    const imgItem = addImage({
      id: `img_${itemId}`,
      name: 'item_img',
      x: 0,
      y: newItemInitialY.value,
      image: imgObj,
      width: TRACK_HEIGHT,
      height: TRACK_HEIGHT,
      fill: 'rgba(255, 255, 255, 1)',
      cornerRadius: 2,
      draggable: false
    });

    imgItem.on('click', function () {
      // 點擊圖片可以選取到主畫布的素材
      selectTargetNode(itemId);
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
      x: TRACK_START_X,
      y: newItemInitialY.value,
      width: window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2) - TRACK_START_X,
      height: TRACK_HEIGHT,
      fill: 'rgba(255, 255, 255, 0.6)',
      cornerRadius: 2,
      draggable: false
    });

    timelineLayer.value?.add(imgItem);
    timelineLayer.value?.add(trackItem);
    timelineLayer.value?.add(groupItem);
    updateInitialPosition();
    pointerMoveToTop();
  };

  const getTargetNode = (id: string) => {
    return timelineLayer.value?.findOne(`#${id}`);
  };

  const addTimelineBar = (id: UUIDTypes, duration: number, start: number): string => {
    const groupItem = getTargetNode(`group_${id}`);
    if (!groupItem || !(groupItem instanceof Konva.Group)) return '';
    const barId = uuid();
    const trackWidth = window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2) - TRACK_START_X;
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
      height: TRACK_HEIGHT,
      fill: BAR_ACTIVE_COLOR,
      cornerRadius: 3,
      draggable: true,
      dragBoundFunc(pos) {
        const timelineStageWidth =
          timelineStage.value?.width() ?? window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2);
        return {
          x:
            pos.x < TRACK_START_X
              ? TRACK_START_X
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
      barItem.fill(BAR_ACTIVE_COLOR);
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
    pointerMoveToTop();
    // 回傳 barId
    return barId;
  };

  const removeActiveBarHighLight = () => {
    const activeBar = timelineLayer.value?.findOne('.item_bar_active');
    if (activeBar && activeBar instanceof Konva.Rect) {
      activeBar.fill(BAR_COLOR);
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
        if (newBox.x < TRACK_START_X) {
          return oldBox;
        }
        if (
          newBox.x + newBox.width >
          (timelineStage.value?.width() ?? window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2))
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

  const addImage = (imageConfig: ImageConfig) => {
    return new Konva.Image(imageConfig);
  };

  const addRect = (rectConfig: Partial<NodeConfig>) => {
    return new Konva.Rect(rectConfig);
  };

  const addGroup = (groupConfig: GroupConfig) => {
    return new Konva.Group(groupConfig);
  };

  const deleteTimelineTrack = (id: UUIDTypes) => {
    // 隱藏空的變形器
    hideEmptyTransformer(id);
    const imgItem = getTargetNode(`img_${id}`);
    if (imgItem && imgItem instanceof Konva.Image) {
      // 刪除 Img
      imgItem.destroy();
      // 更新所有 Img 的位置
      updateAllItems('.item_img');
    }
    const trackItem = getTargetNode(`track_${id}`);
    if (trackItem && trackItem instanceof Konva.Rect) {
      // 刪除 Track
      trackItem.destroy();
      // 更新所有 Track 的位置
      updateAllItems('.item_track');
    }
    const groupItem = getTargetNode(`group_${id}`);
    if (groupItem && groupItem instanceof Konva.Group) {
      // 刪除 Bar Group
      groupItem.destroy();
      // 更新所有 Bar Group 的位置
      updateAllItems('.item_bar_group');
    }
    // 更新起始位置
    updateInitialPosition();
  };

  // 更新起始位置 (用 track 來找)
  const updateInitialPosition = () => {
    const tracks = timelineLayer.value?.find('.item_track') ?? [];
    newItemInitialY.value = tracks.length * (TRACK_HEIGHT + GAP_Y);
  };

  // 隱藏空的變形器
  const hideEmptyTransformer = (id: UUIDTypes) => {
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
  const updateAllItems = (selectorName: string) => {
    const items = timelineLayer.value?.find(selectorName) ?? [];
    items.forEach((item, index) => {
      item.y(index * (TRACK_HEIGHT + GAP_Y));
    });
  };

  const updatePointer = (gsapTimeline: GSAPTimeline | null) => {
    if (timelinePointer.value && gsapTimeline && !isDraggingPointer.value) {
      const progress = gsapTimeline.progress();
      const trackWidth = window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2) - TRACK_START_X;
      timelinePointer.value.x(trackWidth * progress + TRACK_START_X);
      // console.log('progress:', progress);
    }
  };

  const movePointer = (x: number) => {
    // 移動 pointer
    timelinePointer.value?.x(x + TRACK_START_X);
    // 更新 gsap 時間軸
    updateGsapTimelineByPointerPosition(x);
  };

  const updateGsapTimelineByPointerPosition = (x: number) => {
    const { getGsapTimeline, TOTAL_DURATION } = useGsap();
    const gsapTimeline = getGsapTimeline();
    if (gsapTimeline) {
      const currentTime =
        ((x - TRACK_START_X) /
          (window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2) - TRACK_START_X)) *
        TOTAL_DURATION;
      // 更新 gsap 時間軸
      gsapTimeline.seek(currentTime);
      // console.log('currentTime:', currentTime);
    }
  };

  const updateTimelineLayer = () => {
    timelineLayer.value?.draw();
  };

  const lockPointer = () => {
    timelinePointer.value?.draggable(false);
  };
  const unlockPointer = () => {
    timelinePointer.value?.draggable(true);
  };

  return {
    // state
    timelineStageRef,
    timelineTransformers,
    timelinePointer,
    // action
    initTimelineKonva,
    destroyTimelineKonva,
    addTimelineTrack,
    addTimelineBar,
    deleteTimelineTrack,
    updatePointer,
    updateTimelineLayer,
    lockPointer,
    unlockPointer
  };
};
