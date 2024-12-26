// Konva: https://konvajs.org/api/Konva.html
import { useResizeObserver } from '@vueuse/core';
import Konva from 'konva';
import type { Node } from 'konva/lib/Node';
import { v4 as uuid, type UUIDTypes } from 'uuid';
const { addTimelineItem, deleteTimelineItem } = useTimeline();

interface AdModuleConfig {
  width: number;
  height: number;
}
interface MyNode {
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

export const useKonva = (adModuleConfig?: AdModuleConfig) => {
  const HEADER_HEIGHT = 56;
  const FOOTER_HEIGHT = 274;
  const ASIDE_WIDTH = 0; // 已拿掉左側工具列
  const DELTA = 1;
  const mainStageRef = useState<HTMLDivElement | null>('mainStageRef', () => shallowRef(null));
  const mainStageBgRef = useState<HTMLDivElement | null>('mainStageBgRef', () => shallowRef(null));
  let stage = useState<Konva.Stage | null>('stage', () => shallowRef(null));
  let container = useState<HTMLDivElement | null>('container', () => shallowRef(null));
  let layer = useState<Konva.Layer | null>('layer', () => shallowRef(null));
  let selectionRect = useState<Konva.Rect | null>('selectionRect', () => shallowRef(null));
  let adModuleRect = useState<Konva.Rect | null>('adModuleRect', () => shallowRef(null));
  // 需要偵測他的 nodes 數量，所以不能用 shallowRef
  let transformer = useState<Konva.Transformer | null>('transformer', () => null);
  let mainNodeList = useState<MyNode[]>('mainNodeList', () => []);
  const selecting = ref(false);
  const adModuleX = ref(0);
  const adModuleY = ref(0);
  const newItemInitialX = ref(0);
  const newItemInitialY = ref(0);
  const x1 = ref(0);
  const y1 = ref(0);
  const x2 = ref(0);
  const y2 = ref(0);
  const scaleBy = 1.05; // scale 的單位幅度

  const initKonva = () => {
    // create Stage
    createStage();
    // create Layer
    createLayer();
    // create Transformer
    createTransformer();
    // create adModule Rectangle(廣告框)
    createAdModuleRect();
    // create Selection Rectangle(選取框)
    createSelectionRect();

    // 使用 resize 觀察者
    useResizeObserver(mainStageRef, (entries) => {
      if (!stage.value || !layer.value) return;
      const entry = entries[0];
      // 響應式調整 Stage 寬高
      const { width, height } = entry.contentRect;
      stage.value.width(width);
      stage.value.height(height);
      // 調整 newItemInitial
      newItemInitialX.value = stage.value.width() / 2;
      newItemInitialY.value = stage.value.height() / 2;
      // 調整 adModuleRect 位置
      const oldX = adModuleX.value;
      const oldY = adModuleY.value;
      adModuleX.value = stage.value.width() / 2 - (adModuleConfig?.width || 320) / 2;
      adModuleY.value = stage.value.height() / 2 - (adModuleConfig?.height || 320) / 2;
      adModuleRect.value?.setAttrs({
        x: adModuleX.value,
        y: adModuleY.value
      });
      // 調整 layer 所有 node 的位置
      layer.value.getChildren().forEach((node) => {
        if (node.hasName('item')) {
          const nodeNewX = node.x() + (adModuleX.value - oldX);
          const nodeNewY = node.y() + (adModuleY.value - oldY);
          // 這是真實在 Stage 上的 x, y
          node.x(nodeNewX);
          node.y(nodeNewY);
          // 同時調整 mainNodeList (mainNode 的 x, y 是相對於 adModuleRect 的)
          const targetMainNode = mainNodeList.value.find((item) => item.id === node.id());
          if (targetMainNode) {
            targetMainNode.x = nodeNewX - adModuleX.value;
            targetMainNode.y = nodeNewY - adModuleY.value;
          }
        }
      });
    });

    // 註冊 Stage 事件
    if (
      stage.value !== null &&
      transformer.value !== null &&
      selectionRect.value !== null &&
      container.value !== null
    )
      addStageEvents(stage.value, transformer.value, selectionRect.value, container.value);
  };

  // 用來觀察 Konva 的函數
  const logKonva = () => {
    console.log(layer.value?.getChildren());
  };

  // TODO: 清除 Konva
  const destroyKonva = () => {};

  const createStage = () => {
    if (mainStageRef.value) {
      stage.value = new Konva.Stage({
        container: mainStageRef.value,
        width: window.innerWidth - ASIDE_WIDTH, // 減去 aside width
        height: window.innerHeight - (FOOTER_HEIGHT + HEADER_HEIGHT),
        draggable: false
      });
      container.value = stage.value.container();
      container.value.tabIndex = 2;
      container.value.style.outline = 'none';
      container.value.style.position = 'relative';
      // Stage 初始位置
      newItemInitialX.value = stage.value.width() / 2;
      newItemInitialY.value = stage.value.height() / 2;
      container.value.focus();
    } else {
      throw new Error('mainStageRef Not Found');
    }
  };

  const createLayer = () => {
    layer.value = new Konva.Layer();
    stage.value?.add(layer.value);
  };

  const createTransformer = () => {
    transformer.value = new Konva.Transformer({
      // 外框線顏色
      borderStroke: '#6366f1',
      anchorStyleFunc: (anchor) => {
        anchor.cornerRadius(10);
        anchor.stroke('#6366f1');
        // 中間的錨點樣式
        if (anchor.hasName('top-center') || anchor.hasName('bottom-center')) {
          anchor.height(6);
          anchor.offsetY(3);
          anchor.width(30);
          anchor.offsetX(15);
        }
        if (anchor.hasName('middle-left') || anchor.hasName('middle-right')) {
          anchor.height(30);
          anchor.offsetY(15);
          anchor.width(6);
          anchor.offsetX(3);
        }
      }
    });

    // 事件監聽
    transformer.value.on('transform', (e) => {
      const selectedNodes = transformer.value?.nodes();
      if (!selectedNodes) return;
      selectedNodes.forEach((node) => {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const rotation = node.rotation();
        const width = node.width() * scaleX;
        const height = node.height() * scaleY;
        // 將變形後的屬性設定回去
        node.setAttrs({
          width,
          height,
          scaleX: 1,
          scaleY: 1,
          rotation
        });
        // 同時塞給 mainNodeList
        const targetMainNode = mainNodeList.value.find((item) => item.id === node.id());
        if (targetMainNode) {
          targetMainNode.width = width;
          targetMainNode.height = height;
          targetMainNode.rotation = rotation;
        }
      });
    });
    transformer.value.on('dragmove', (e) => {
      const selectedNodes = transformer.value?.nodes();
      if (!selectedNodes) return;
      selectedNodes.forEach((node) => {
        const x = node.x();
        const y = node.y();
        // 將變形後的屬性設定回去
        node.setAttrs({
          x,
          y
        });
        // 同時更新 mainNodeList
        updateMainNodePosition(selectedNodes);
      });
    });

    layer.value?.add(transformer.value);
  };

  const createAdModuleRect = () => {
    adModuleX.value = stage.value?.getAttr('width') / 2 - (adModuleConfig?.width || 320) / 2;
    adModuleY.value = stage.value?.getAttr('height') / 2 - (adModuleConfig?.height || 320) / 2;

    adModuleRect.value = new Konva.Rect({
      fill: 'rgba(220, 220, 220, 0.35)',
      // disable events to not interrupt with events
      width: adModuleConfig?.width || 320,
      height: adModuleConfig?.height || 480,
      // center
      x: adModuleX.value,
      y: adModuleY.value,
      listening: false
    });
    // if (adModuleRect.value) console.log(adModuleRect.value.x(), adModuleRect.value.y());
    layer.value?.add(adModuleRect.value);
  };

  const createSelectionRect = () => {
    selectionRect.value = new Konva.Rect({
      fill: 'rgba(83, 122, 234, 0.5)',
      stroke: 'rgba(83, 122, 234, 0.9)',
      visible: false,
      // disable events to not interrupt with events
      listening: false
    });
    layer.value?.add(selectionRect.value);
  };

  const addStageEvents = (
    currentStage: Konva.Stage,
    currentTransformer: Konva.Transformer,
    currentSelectionRect: Konva.Rect,
    currentContainer: HTMLDivElement
  ) => {
    // 1
    currentStage.on('mousedown touchstart', (e) => {
      // e.target 的 Stage 會不等於被 Vue ref 封裝後的 Stage，所以用 _id 來比對
      if (e.target._id !== currentStage._id) {
        if (
          e.target.hasName('item') &&
          !currentTransformer.nodes().find((node) => node._id === e.target._id)
        )
          currentTransformer.nodes([e.target]);
        return;
      }

      e.evt.preventDefault();
      e.evt.stopPropagation();
      // 起始點為空白區域才能接續後面的動作
      x1.value = currentStage.getPointerPosition()?.x || 0;
      y1.value = currentStage.getPointerPosition()?.y || 0;
      x2.value = currentStage.getPointerPosition()?.x || 0;
      y2.value = currentStage.getPointerPosition()?.y || 0;

      currentSelectionRect.width(0);
      currentSelectionRect.height(0);
      selecting.value = true;
    });

    // 2
    currentStage.on('mousemove touchmove', (e) => {
      if (!selecting.value) return;

      e.evt.preventDefault();
      e.evt.stopPropagation();
      x2.value = currentStage.getPointerPosition()?.x || 0;
      y2.value = currentStage.getPointerPosition()?.y || 0;

      currentSelectionRect.setAttrs({
        visible: true,
        x: Math.min(x1.value, x2.value),
        y: Math.min(y1.value, y2.value),
        width: Math.abs(x2.value - x1.value),
        height: Math.abs(y2.value - y1.value)
      });
    });

    // 3
    currentStage.on('mouseup touchend', (e) => {
      // do nothing if we didn't start selection
      selecting.value = false;
      if (!currentSelectionRect.visible()) {
        return;
      }
      e.evt.preventDefault();
      e.evt.stopPropagation();
      // update visibility in timeout, so we can check it in click event
      currentSelectionRect.visible(false);
      var stageItems = currentStage.find('.item');
      var SelectionBox = currentSelectionRect.getClientRect();
      var selected = stageItems.filter((stageItem) =>
        Konva.Util.haveIntersection(SelectionBox, stageItem.getClientRect())
      );
      currentTransformer.nodes(selected);
    });

    // 4
    currentStage.on('click tap', (e) => {
      // 點擊選取範圍內，不做任何事
      if (currentSelectionRect.visible()) {
        return;
      }

      // 點擊空白區域，清空所有選取的物件
      // e.target 的 Stage 會不等於被 Vue ref 封裝後的 Stage，所以用 _id 來比對
      if (e.target._id === currentStage._id) {
        clearTransformer();
        return;
      }

      // 點擊非可動的物件，不做任何事
      if (!e.target.hasName('item')) {
        return;
      }

      // do we pressed shift or ctrl?
      const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
      const isSelected = currentTransformer.nodes().indexOf(e.target) >= 0;

      if (!metaPressed && !isSelected) {
        // if no key pressed and the node is not selected
        // select just one
        currentTransformer.nodes([e.target]);
      } else if (metaPressed && isSelected) {
        // if we pressed keys and node was selected
        // we need to remove it from selection:
        const nodes = currentTransformer.nodes().slice(); // use slice to have new copy of array
        // remove node from array
        nodes.splice(nodes.indexOf(e.target), 1);
        currentTransformer.nodes(nodes);
      } else if (metaPressed && !isSelected) {
        // add the node into selection
        const nodes = currentTransformer.nodes().concat([e.target]);
        currentTransformer.nodes(nodes);
      }
      currentContainer.focus();
    });

    // 5 zoom
    currentStage.on('wheel', (e) => {
      e.evt.preventDefault();
      e.evt.stopPropagation();
      // 必須是在按下 ⌘ 時才能縮放
      if (!e.evt.metaKey) return;

      const oldScale = currentStage.scaleX();
      const pointer = currentStage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: Number(((pointer.x - currentStage.x()) / oldScale).toFixed(2)),
        y: Number(((pointer.y - currentStage.y()) / oldScale).toFixed(2))
      };

      // 決定是 Zoom In or Zoom Out
      let direction = e.evt.deltaY > 0 ? 1 : -1;

      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      const newPos = {
        x: Number((pointer.x - mousePointTo.x * newScale).toFixed(2)),
        y: Number((pointer.y - mousePointTo.y * newScale).toFixed(2))
      };

      currentStage.scale({ x: newScale, y: newScale });
      currentStage.position(newPos);

      if (mainStageBgRef.value) {
        const scaleCorrection = Number((1 / newScale).toFixed(2));
        mainStageBgRef.value.style.transform = `scale(${newScale})`;
        mainStageBgRef.value.style.width = `${scaleCorrection * 100}%`;
        mainStageBgRef.value.style.height = `${scaleCorrection * 100}%`;
      }
    });

    // 6
    currentContainer.addEventListener('keydown', keyboardEventHandler);
  };

  const clearTransformer = () => {
    transformer.value?.nodes([]);
  };

  const keyboardEventHandler = (e: KeyboardEvent) => {
    const selectedNodes = transformer.value?.nodes();
    if (!selectedNodes || selectedNodes.length === 0) return;

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        deleteItems(selectedNodes);
        clearTransformer();
        break;
      case 'Escape':
        clearTransformer();
        break;
      case 'ArrowUp':
        selectedNodes.forEach((node) => node.y(node.y() - DELTA));
        updateMainNodePosition(selectedNodes);
        break;
      case 'ArrowDown':
        selectedNodes.forEach((node) => node.y(node.y() + DELTA));
        updateMainNodePosition(selectedNodes);
        break;
      case 'ArrowLeft':
        selectedNodes.forEach((node) => node.x(node.x() - DELTA));
        updateMainNodePosition(selectedNodes);
        break;
      case 'ArrowRight':
        selectedNodes.forEach((node) => node.x(node.x() + DELTA));
        updateMainNodePosition(selectedNodes);
        break;
      default:
        break;
    }
  };

  const updateMainNodePosition = (selectedNodes: Node[]) => {
    selectedNodes.forEach((node) => {
      const targetMainNode = mainNodeList.value.find((item) => item.id === node.id());
      if (targetMainNode) {
        targetMainNode.x = node.x() - adModuleX.value;
        targetMainNode.y = node.y() - adModuleY.value;
      }
    });
  };

  const deleteItems = (selectedNodes: Node[]) => {
    selectedNodes.forEach((node) => {
      // 同時移除 mainNodeList
      deleteMainNode(node.id());
      // 同時刪除 TimelineItem
      deleteTimelineItem(node.id());
      // 刪除 Node(Img)
      node.destroy();
    });
  };

  const deleteMainNode = (id: UUIDTypes) => {
    const targetIndex = mainNodeList.value.findIndex((item) => item.id === id);
    if (targetIndex > -1) mainNodeList.value.splice(targetIndex, 1);
  };

  const addImage = (imgObj: HTMLImageElement) => {
    const id = uuid();
    const imgConfig = {
      id: id,
      name: 'item',
      label: '未命名',
      x: newItemInitialX.value - imgObj.naturalWidth / 2,
      y: newItemInitialY.value - imgObj.naturalHeight / 2,
      width: imgObj.naturalWidth,
      height: imgObj.naturalHeight,
      rotation: 0,
      opacity: 1
    };
    const imgItem = new Konva.Image({
      ...imgConfig,
      image: imgObj,
      draggable: true
    });
    focusOnItem(imgItem);
    addMainNode(imgConfig);
    addTimelineItem(imgObj, id);
    updateInitialPosition();
  };

  const addMainNode = (imgNode: MyNode) => {
    mainNodeList.value.push(imgNode);
  };

  const addRect = () => {
    const rectItem = new Konva.Rect({
      name: 'item',
      x: newItemInitialX.value,
      y: newItemInitialY.value,
      width: 100,
      height: 100,
      fill: '#22c55e',
      draggable: true
    });
    focusOnItem(rectItem);
    updateInitialPosition();
  };

  const focusOnItem = (item: Konva.Shape | Konva.Group | Konva.Image) => {
    layer.value?.add(item);
    transformer.value?.nodes([item]);
    // 把變形器移到最上面
    transformer.value?.moveToTop();
    // 把選取框移到最上面
    selectionRect.value?.moveToTop();
    // focus on container(可以使用鍵盤事件)
    container.value?.focus();
  };
  const updateInitialPosition = () => {
    newItemInitialX.value += 10;
    newItemInitialY.value += 10;
  };

  return {
    mainStageRef,
    mainStageBgRef,
    stage,
    layer,
    initKonva,
    destroyKonva,
    transformer,
    addImage,
    addRect,
    logKonva,
    mainNodeList
  };
};
