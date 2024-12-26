// Konva: https://konvajs.org/api/Konva.html
import { useResizeObserver } from '@vueuse/core';
import Konva from 'konva';
import type { NodeConfig } from 'konva/lib/Node';
import type { ImageConfig } from 'konva/lib/shapes/Image';
import type { UUIDTypes } from 'uuid';

export const useTimeline = () => {
  // const HEADER_HEIGHT = 56;
  // const FOOTER_HEIGHT = 274;
  const TIMELINE_CONTAINER_HEIGHT = 240;
  const ASIDE_WIDTH = 0;
  const PADDING_X = 16;
  const GAP_Y = 4;
  const TRACK_HEIGHT = 24;
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

  const addTimelineItem = (imgObj: HTMLImageElement, itemId: string) => {
    // const groupItem = new Konva.Group({
    //   id: itemId,
    //   name: 'item',
    //   x: newItemInitialX.value,
    //   y: newItemInitialY.value,
    //   draggable: true,
    //   dragBoundFunc: function (pos) {
    //     return {
    //       x:
    //         pos.x < 0
    //           ? 0
    //           : pos.x >
    //               (timelineStage.value?.width() ??
    //                 window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2))
    //             ? (timelineStage.value?.width() ??
    //               window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2))
    //             : pos.x,
    //       y: this.absolutePosition().y
    //     };
    //   }
    // });

    const imgItem = addImage({
      id: `img_${itemId}`,
      name: 'item_img',
      x: 0,
      y: newItemInitialY.value,
      image: imgObj,
      width: TRACK_HEIGHT,
      height: TRACK_HEIGHT,
      fill: 'rgba(255, 255, 255, 1)',
      cornerRadius: 3,
      draggable: false
    });
    const trackItem = addRect({
      id: `track_${itemId}`,
      name: 'item_track',
      x: TRACK_HEIGHT + 8,
      y: newItemInitialY.value,
      width: window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2),
      height: TRACK_HEIGHT,
      fill: 'rgba(255, 255, 255, 0.6)',
      cornerRadius: 3,
      draggable: false
    });
    // const transformerItem = addTransformer();

    timelineLayer.value?.add(imgItem);
    timelineLayer.value?.add(trackItem);
    updateInitialPosition();
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
          anchor.height(24);
          anchor.offsetY(12);
          anchor.width(6);
          anchor.offsetX(3);
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

  const deleteTimelineItem = (id: UUIDTypes) => {
    const groupItem = timelineLayer.value?.findOne(`#${id}`);
    if (groupItem && groupItem instanceof Konva.Group) {
      // 刪除 Group(這個動作並不會清空 Transformer)
      groupItem.destroy();
      // 隱藏空的變形器
      hiddenEmptyTransformer(id);
      // 更新所有 Group 的位置
      updateAllGroupItems();
      // 更新 Group 的建立位置
      updateInitialPosition();
    }
  };

  // 更新 Group 的建立位置
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
  const updateAllGroupItems = () => {
    const groups = timelineLayer.value?.find('.item') ?? [];
    groups.forEach((group, index) => {
      group.y(index * 40);
    });
  };

  return {
    timelineStageRef,
    initTimelineKonva,
    destroyTimelineKonva,
    addTimelineItem,
    deleteTimelineItem
  };
};
