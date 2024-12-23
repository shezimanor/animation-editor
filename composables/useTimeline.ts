// Konva: https://konvajs.org/api/Konva.html
import { useResizeObserver } from '@vueuse/core';
import Konva from 'konva';
import type { UUIDTypes } from 'uuid';

export const useTimeline = () => {
  // const HEADER_HEIGHT = 56;
  // const FOOTER_HEIGHT = 274;
  const TIMELINE_HEIGHT = 240;
  const ASIDE_WIDTH = 72;
  const PADDING_X = 16;
  const DELTA = 4;
  const timelineStageRef = useState<HTMLDivElement | null>('timelineStageRef', () => null);
  let timelineStage = useState<Konva.Stage | null>('timelineStage', () => null);
  let timelineContainer = useState<HTMLDivElement | null>('timelineContainer', () => null);
  let timelineLayer = useState<Konva.Layer | null>('timelineLayer', () => null);
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
        height: TIMELINE_HEIGHT,
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
    const groupItem = new Konva.Group({
      id: itemId,
      name: 'item',
      x: newItemInitialX.value,
      y: newItemInitialY.value,
      draggable: true,
      dragBoundFunc: function (pos) {
        return {
          x:
            pos.x < 0
              ? 0
              : pos.x >
                  (timelineStage.value?.width() ??
                    window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2))
                ? (timelineStage.value?.width() ??
                  window.innerWidth - (ASIDE_WIDTH + PADDING_X * 2))
                : pos.x,
          y: this.absolutePosition().y
        };
      }
    });

    const imgItem = addImage(imgObj);
    const rectItem = addRect();
    const transformerItem = addTransformer();

    groupItem.add(rectItem);
    groupItem.add(imgItem);
    transformerItem.nodes([groupItem]);
    timelineLayer.value?.add(groupItem);
    updateInitialPosition();
  };

  const addTransformer = () => {
    if (timelineTransformers.value.length > 0) {
      const currentTransformer = timelineTransformers.value.find(
        (transformer) => transformer.nodes().length === 0
      );
      if (currentTransformer) return currentTransformer;
    }
    const transformer = new Konva.Transformer({
      rotateEnabled: false,
      rotateLineVisible: false,
      enabledAnchors: ['middle-left', 'middle-right']
    });
    timelineLayer.value?.add(transformer);
    timelineTransformers.value.push(transformer);
    return transformer;
  };

  const addImage = (imgObj: HTMLImageElement) => {
    return new Konva.Image({
      name: 'item_img',
      x: 4,
      y: 4,
      image: imgObj,
      width: 28,
      height: 28,
      stroke: 'rgba(90, 90, 90, 1)',
      strokeWidth: 1,
      cornerRadius: 2
    });
  };

  const addRect = () => {
    return new Konva.Rect({
      name: 'item_rect',
      x: 0,
      y: 0,
      width: 120,
      height: 36,
      fill: 'rgba(255, 255, 255, 0.6)',
      stroke: 'rgba(255, 255, 255, 1)',
      strokeWidth: 1,
      cornerRadius: 4
    });
  };

  const updateInitialPosition = () => {
    const groups = timelineLayer.value?.find('.item') ?? [];
    newItemInitialY.value = groups.length * 40;
    console.log(newItemInitialY.value, groups.length);
  };

  return {
    timelineStageRef,
    initTimelineKonva,
    destroyTimelineKonva,
    addTimelineItem
  };
};
