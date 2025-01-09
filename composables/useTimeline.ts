// Konva: https://konvajs.org/api/Konva.html
import { useResizeObserver } from '@vueuse/core';
import Konva from 'konva';
import type { NodeConfig } from 'konva/lib/Node';
import type { ImageConfig } from 'konva/lib/shapes/Image';
import type { GroupConfig } from 'konva/lib/Group';
import { type UUIDTypes } from 'uuid';
const {
  selectTargetNodeFromMain,
  timelineLayer,
  getTargetNodeFromTimeline,
  timelineTransformers,
  timelinePointer,
  isDraggingTimelinePointer,
  updateGsapTimelineByPointerPosition
} = useGlobal();

export const useTimeline = () => {
  console.log('useTimeline');
  // composable 專用常數
  const TIMELINE_CONTAINER_HEIGHT = 240;
  const TIMELINE_TRACK_GAP_Y = 4;
  const TIMELINE_POINTER_WIDTH = 4;
  const TIMELINE_POINTER_COLOR = 'rgba(129, 141, 248, 0.8)'; // '#818cf8'
  // ---
  const timelineStageRef = useState<HTMLDivElement | null>('timelineStageRef', () =>
    shallowRef(null)
  );
  const timelineStage = useState<Konva.Stage | null>('timelineStage', () => shallowRef(null));
  const timelineContainer = useState<HTMLDivElement | null>('timelineContainer', () =>
    shallowRef(null)
  );
  const newItemInitialY = ref(0);

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

  const addTimelineTrack = (imgObj: HTMLImageElement, itemId: string) => {
    // 只用來放置整個軌道的動畫條群組
    const groupItem = addGroup({
      id: `group_${itemId}`,
      name: 'item_bar_group',
      x: TIMELINE_TRACK_START_X,
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
      y: newItemInitialY.value,
      width:
        window.innerWidth -
        (ASIDE_WIDTH + TIMELINE_CONTAINER_PADDING_X * 2) -
        TIMELINE_TRACK_START_X,
      height: TIMELINE_TRACK_HEIGHT,
      fill: 'rgba(255, 255, 255, 0.6)',
      cornerRadius: 2,
      draggable: false
    });

    timelineLayer.value?.add(imgItem);
    timelineLayer.value?.add(trackItem);
    timelineLayer.value?.add(groupItem);
    // 將指針推到最上面
    timelinePointer.value?.moveToTop();
    // 更新起始位置
    updateInitialPosition();
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
    const imgItem = getTargetNodeFromTimeline(`img_${id}`);
    if (imgItem && imgItem instanceof Konva.Image) {
      // 刪除 Img
      imgItem.destroy();
      // 更新所有 Img 的位置
      updateAllItems('.item_img');
    }
    const trackItem = getTargetNodeFromTimeline(`track_${id}`);
    if (trackItem && trackItem instanceof Konva.Rect) {
      // 刪除 Track
      trackItem.destroy();
      // 更新所有 Track 的位置
      updateAllItems('.item_track');
    }
    const groupItem = getTargetNodeFromTimeline(`group_${id}`);
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
    newItemInitialY.value = tracks.length * (TIMELINE_TRACK_HEIGHT + TIMELINE_TRACK_GAP_Y);
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
      item.y(index * (TIMELINE_TRACK_HEIGHT + TIMELINE_TRACK_GAP_Y));
    });
  };

  return {
    // state
    timelineStageRef,
    // action
    initTimelineKonva,
    destroyTimelineKonva,
    addTimelineTrack,
    deleteTimelineTrack
  };
};
