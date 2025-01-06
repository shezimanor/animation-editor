// Konva: https://konvajs.org/api/Konva.html
import { useResizeObserver } from '@vueuse/core';
import Konva from 'konva';
import type { NodeConfig } from 'konva/lib/Node';
import type { ImageConfig } from 'konva/lib/shapes/Image';
import { v4 as uuid, type UUIDTypes } from 'uuid';

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
  const TRACK_START_X = TRACK_HEIGHT + IMG_MARGIN;
  const timelineStageRef = useState<HTMLDivElement | null>('timelineStageRef', () =>
    shallowRef(null)
  );
  const timelineStage = useState<Konva.Stage | null>('timelineStage', () => shallowRef(null));
  const timelineContainer = useState<HTMLDivElement | null>('timelineContainer', () =>
    shallowRef(null)
  );
  const timelineLayer = useState<Konva.Layer | null>('timelineLayer', () => shallowRef(null));
  const newItemInitialX = ref(0);
  const newItemInitialY = ref(0);
  const timelineTransformers = ref<Konva.Transformer[]>([]);
  const x1 = ref(0);
  const y1 = ref(0);
  const x2 = ref(0);
  const y2 = ref(0);

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
      fill: '#60a5fa',
      cornerRadius: 2,
      draggable: true,
      dragBoundFunc: function (pos) {
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
    timelineLayer.value?.add(pointer);
    pointer.moveToTop();
  };

  const pointerMoveToTop = () => {
    const pointer = timelineLayer.value?.findOne('.item_pointer');
    pointer?.moveToTop();
  };

  const addTimelineTrack = (imgObj: HTMLImageElement, itemId: string) => {
    // 只用來放置動畫條
    const groupItem = new Konva.Group({
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

  const addTimelineBar = (id: UUIDTypes) => {
    const groupItem = getTargetNode(`group_${id}`);
    if (!groupItem || !(groupItem instanceof Konva.Group)) return;
    const barId = uuid();
    const trackWidth = window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2) - TRACK_START_X;
    // 時間軸動畫條
    const barItem = addRect({
      id: `bar_${barId}`,
      name: `item_bar`,
      // 這裡的 x,y 位置是相對於 group 的位置
      x: 0,
      y: 0,
      width: trackWidth / 12,
      height: TRACK_HEIGHT,
      fill: '#22d3ee',
      cornerRadius: 3,
      draggable: true,
      dragBoundFunc: function (pos) {
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
    const transformerItem = addTransformer();
    groupItem.add(barItem);
    // 加上變形器
    transformerItem.nodes([barItem]);
    pointerMoveToTop();
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
    const transformer = new Konva.Transformer({
      borderStroke: 'rgba(255, 255, 255, 0.6)',
      rotateEnabled: false,
      rotateLineVisible: false,
      enabledAnchors: ['middle-left', 'middle-right'],
      visible: true,
      anchorStyleFunc: (anchor) => {
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
    timelineLayer.value?.add(transformer);
    timelineTransformers.value.push(transformer);
    return transformer;
  };

  const addImage = (imageConfig: ImageConfig) => {
    return new Konva.Image(imageConfig);
  };

  const addRect = (rectConfig: Partial<NodeConfig>) => {
    return new Konva.Rect(rectConfig);
  };

  const deleteTimelineTrack = (id: UUIDTypes) => {
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
  const hiddenEmptyTransformer = (id: UUIDTypes) => {
    for (let i = 0; i < timelineTransformers.value.length; i++) {
      const transformer = timelineTransformers.value[i];
      const groups = transformer.nodes();
      if (groups.length > 0 && groups[0].id() === id) {
        transformer.visible(false);
        transformer.nodes([]);
        break;
      }
    }
  };

  // 更新所有 Group 的位置
  const updateAllItems = (selectorName: string) => {
    const items = timelineLayer.value?.find(selectorName) ?? [];
    items.forEach((item, index) => {
      item.y(index * (TRACK_HEIGHT + GAP_Y));
    });
  };

  return {
    // state
    timelineStageRef,
    // action
    initTimelineKonva,
    destroyTimelineKonva,
    addTimelineTrack,
    addTimelineBar,
    deleteTimelineTrack
  };
};
