console.log('exec useKonva');
// Konva: https://konvajs.org/api/Konva.html
import { useResizeObserver, useDebounceFn } from '@vueuse/core';
import Konva from 'konva';
import type { Node } from 'konva/lib/Node';

const {
  adModuleX,
  adModuleY,
  mainLayer,
  mainNodeList,
  mainNodeLength,
  mainNodeMap,
  mainContainer,
  mainSelectionRect,
  mainTransformer,
  focusOnItem,
  timelineTransformers,
  addTimelineTrack,
  deleteTimelineTrack,
  createGsapTimeline,
  currentNodeId,
  createTween,
  createSetPoint,
  updateAllTweenPosition
} = useGlobal();

interface AdModuleConfig {
  width: number;
  height: number;
}

const { toastSuccess, toastWarning } = useNotify();

export const useKonva = (adModuleConfig?: AdModuleConfig) => {
  // composable 專用常數
  const DELTA = 1;
  // ---
  const mainStageRef = useState<HTMLDivElement | null>('mainStageRef', () => shallowRef(null));
  const mainStageBgRef = useState<HTMLDivElement | null>('mainStageBgRef', () => shallowRef(null));
  const stage = useState<Konva.Stage | null>('stage', () => shallowRef(null));
  const isClipMode = useState('isClipMode', () => false);
  const adModuleRect = useState<Konva.Rect | null>('adModuleRect', () => shallowRef(null));

  const selecting = ref(false);

  const mainItemInitialX = ref(0);
  const mainItemInitialY = ref(0);
  // 選取框的座標變數
  const x1 = ref(0);
  const y1 = ref(0);
  const x2 = ref(0);
  const y2 = ref(0);
  const scaleBy = 1.05; // scale 的單位幅度

  const modifyAdModulePositionByResizeWindow = useDebounceFn((width: number, height: number) => {
    if (!stage.value || !mainLayer.value) return;
    stage.value.width(width);
    stage.value.height(height);
    // 調整 newItemInitial
    mainItemInitialX.value = stage.value.width() / 2;
    mainItemInitialY.value = stage.value.height() / 2;
    // 調整 adModuleRect 位置
    const oldX = adModuleX.value;
    const oldY = adModuleY.value;
    adModuleX.value = stage.value.width() / 2 - (adModuleConfig?.width || 320) / 2;
    adModuleY.value = stage.value.height() / 2 - (adModuleConfig?.height || 320) / 2;
    adModuleRect.value?.setAttrs({
      x: adModuleX.value,
      y: adModuleY.value
    });
    const diffX = adModuleX.value - oldX;
    const diffY = adModuleY.value - oldY;
    // 調整 layer 所有 node 的位置
    mainLayer.value.getChildren().forEach((node) => {
      if (node.hasName('item')) {
        const nodeNewX = node.x() + diffX;
        const nodeNewY = node.y() + diffY;
        // 這是真實在 Stage 上的 x, y
        node.x(nodeNewX);
        node.y(nodeNewY);
        // 同時調整 mainNodeList (mainNode 的 x, y 是相對於 adModuleRect 的)
        const targetMainNode = mainNodeMap.value[node.id()];
        if (targetMainNode) {
          targetMainNode.x = nodeNewX - adModuleX.value;
          targetMainNode.y = nodeNewY - adModuleY.value;
        }
      }
    });
    // 調整 layer 的 clip
    if (isClipMode.value) addLayerClip();
    // 調整所有動畫的 x, y
    updateAllTweenPosition(adModuleX.value - oldX, adModuleY.value - oldY);
  }, 200);

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
    // create Timeline Instance
    createGsapTimeline();

    // 使用 resize 觀察者
    useResizeObserver(mainStageRef, (entries) => {
      const entry = entries[0];
      // 響應式調整 Stage 寬高
      const { width, height } = entry.contentRect;
      modifyAdModulePositionByResizeWindow(width, height);
    });

    // 註冊頂層事件
    if (
      stage.value !== null &&
      mainTransformer.value !== null &&
      mainSelectionRect.value !== null &&
      mainContainer.value !== null
    ) {
      // 註冊 Stage 事件
      addStageEvents(
        stage.value,
        mainTransformer.value,
        mainSelectionRect.value,
        mainContainer.value
      );
    }
  };

  // 用來觀察 Konva 的函數
  const logKonva = () => {
    console.log('timelineTransformers:', timelineTransformers.value);
  };

  const logKonvaJSON = () => {
    console.log(stage.value?.toJSON());
    console.log(mainNodeList.value);
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
      mainContainer.value = stage.value.container();
      mainContainer.value.tabIndex = 2;
      mainContainer.value.style.outline = 'none';
      mainContainer.value.style.position = 'relative';
      // Stage 初始位置
      mainItemInitialX.value = stage.value.width() / 2;
      mainItemInitialY.value = stage.value.height() / 2;
      mainContainer.value.focus();
    } else {
      throw new Error('mainStageRef Not Found');
    }
  };

  const createLayer = () => {
    mainLayer.value = new Konva.Layer();
    stage.value?.add(mainLayer.value);
    return mainLayer.value;
  };

  const createTransformer = () => {
    mainTransformer.value = new Konva.Transformer({
      label: 'mainTransformer',
      // 外框線顏色
      borderStroke: '#6366f1',
      anchorStyleFunc(anchor) {
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

    mainTransformer.value.boundBoxFunc((oldBox, newBox) => newBox);

    // 事件監聽
    mainTransformer.value.on('transform', (e) => {
      const selectedNodes = mainTransformer.value?.nodes();
      if (!selectedNodes) return;
      selectedNodes.forEach((node) => {
        const targetMainNode = mainNodeMap.value[node.id()];
        if (targetMainNode) {
          updateNodeAndMainNodeAttributes(node, targetMainNode);
        }
      });
    });
    mainTransformer.value.on('dragmove', (e) => {
      if (!mainTransformer.value || !adModuleRect.value || !mainLayer.value) return;
      const selectedNodes = mainTransformer.value.nodes();
      if (!selectedNodes) return;
      selectedNodes.forEach(() => {
        // 同時更新 mainNodeList
        updateMainNodePosition(selectedNodes);
      });

      // 下面是 Snap to item/rect 的功能
      // 清除所有對齊線
      mainLayer.value.find('.guide-line').forEach((line) => line.destroy());
      // 群組選取時不做對齊
      if (mainTransformer.value.nodes().length > 1) return;
      // 尋找對齊線
      const lineGuideStops = getLineGuideStops(
        mainTransformer.value.nodes() as Konva.Image[],
        adModuleRect.value,
        mainLayer.value
      );
      // 尋找物件的對齊點
      const targetItem = mainTransformer.value.nodes()[0];
      const itemBounds = getItemSnappingEdges(targetItem as Konva.Image);

      // 尋找可以對齊物件
      const guides = getGuides(lineGuideStops, itemBounds);
      // 沒有對齊物件時不做任何事
      if (!guides.length) return;
      // 繪製對齊線
      drawGuides(guides, mainLayer.value);

      // 強制對齊物件位置
      const absPos = targetItem.absolutePosition();
      guides.forEach((lg) => {
        switch (lg.orientation) {
          case 'V': {
            absPos.x = lg.lineGuide + lg.offset;
            break;
          }
          case 'H': {
            absPos.y = lg.lineGuide + lg.offset;
            break;
          }
        }
      });

      targetItem.absolutePosition(absPos);
      // 同時更新 mainNode
      const targetMainNode = mainNodeMap.value[targetItem.id()];
      if (targetMainNode) {
        updateNodeAndMainNodeAttributes(targetItem, targetMainNode);
      }
    });

    mainTransformer.value.on('dragend', function (e) {
      // clear all previous lines on the screen
      mainLayer.value?.find('.guide-line').forEach((line) => line.destroy());
    });

    mainLayer.value?.add(mainTransformer.value);
  };

  const createAdModuleRect = () => {
    adModuleX.value = stage.value?.getAttr('width') / 2 - (adModuleConfig?.width || 640) / 2;
    adModuleY.value = stage.value?.getAttr('height') / 2 - (adModuleConfig?.height || 320) / 2;

    adModuleRect.value = new Konva.Rect({
      fill: 'rgba(220, 220, 220, 0.35)',
      // disable events to not interrupt with events
      width: adModuleConfig?.width || 640,
      height: adModuleConfig?.height || 320,
      // center
      x: adModuleX.value,
      y: adModuleY.value,
      listening: false
    });
    // if (adModuleRect.value) console.log(adModuleRect.value.x(), adModuleRect.value.y());
    mainLayer.value?.add(adModuleRect.value);
  };

  const createSelectionRect = () => {
    mainSelectionRect.value = new Konva.Rect({
      fill: 'rgba(83, 122, 234, 0.5)',
      stroke: 'rgba(83, 122, 234, 0.9)',
      visible: false,
      // disable events to not interrupt with events
      listening: false
    });
    mainLayer.value?.add(mainSelectionRect.value);
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

      // 更新裁切邊界, mainLayer.value?.clip().x === undefined 表示沒有開過這個功能
      if (!isClipMode.value && mainLayer.value?.clip().x !== undefined) removeLayerClip();

      // 更新背景圖的縮放
      if (mainStageBgRef.value) {
        const scaleCorrection = Number((1 / newScale).toFixed(2));
        mainStageBgRef.value.style.transform = `scale(${newScale}, ${newScale})`;
        mainStageBgRef.value.style.width = `${scaleCorrection * 100}%`;
        mainStageBgRef.value.style.height = `${scaleCorrection * 100}%`;
      }
    });

    // 6
    currentContainer.addEventListener('keydown', keyboardEventHandler);
  };

  const clearTransformer = () => {
    mainTransformer.value?.nodes([]);
  };
  const removeNodeFromTransformer = (node: Node) => {
    const selectedNodes = mainTransformer.value?.nodes();
    if (selectedNodes) {
      const newNodes = selectedNodes.filter((item) => item.id() !== node.id());
      mainTransformer.value?.nodes(newNodes);
    }
  };

  const keyboardEventHandler = (e: KeyboardEvent) => {
    const selectedNodes = mainTransformer.value?.nodes();
    if (!selectedNodes || selectedNodes.length === 0) return;

    switch (e.key) {
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
      case 'w': // 快捷鍵新增動畫
        if (selectedNodes.length !== 1) break;
        createTween(selectedNodes[0]);
        currentNodeId.value = selectedNodes[0].id();
        break;
      case 'e': // 快捷鍵新增節點
        if (selectedNodes.length !== 1) break;
        createSetPoint(selectedNodes[0]);
        currentNodeId.value = selectedNodes[0].id();
        break;
      default:
        break;
    }
  };

  const addLayerClip = () => {
    const bound = {
      x: adModuleX.value,
      y: adModuleY.value,
      width: adModuleRect.value?.width() || 640,
      height: adModuleRect.value?.height() || 320
    };
    mainLayer.value?.clip(bound);
    // console.log(bound);
  };

  const removeLayerClip = () => {
    console.log('removeLayerClip');
    const bound = stage.value
      ? {
          x: -stage.value.x() / stage.value.scaleX(),
          y: -stage.value.y() / stage.value.scaleY(),
          width: stage.value.width() / stage.value.scaleX(),
          height: stage.value.height() / stage.value.scaleY()
        }
      : {
          x: 0,
          y: 0,
          width: window.innerWidth - ASIDE_WIDTH,
          height: window.innerHeight - (FOOTER_HEIGHT + HEADER_HEIGHT)
        };
    mainLayer.value?.clip(bound);
    // console.log(bound);
  };

  const resetZooming = () => {
    if (!stage.value) return;
    const currentStage = stage.value;
    currentStage.scale({ x: 1, y: 1 });
    currentStage.position({ x: 0, y: 0 });
    // 更新裁切邊界, mainLayer.value?.clip().x === undefined 表示沒有開過這個功能
    if (!isClipMode.value && mainLayer.value?.clip().x !== undefined) removeLayerClip();
    // 更新背景圖的縮放
    if (mainStageBgRef.value) {
      mainStageBgRef.value.style.transform = `scale(1,1)`;
      mainStageBgRef.value.style.width = `100%`;
      mainStageBgRef.value.style.height = `100%`;
    }
  };

  const updateMainNodePosition = (selectedNodes: Node[]) => {
    selectedNodes.forEach((node) => {
      const targetMainNode = mainNodeMap.value[node.id()];
      if (targetMainNode) {
        updateNodeAndMainNodeAttributes(node, targetMainNode);
      }
    });
  };

  const updateMainNodeState = () => {
    const allNodes = mainLayer.value?.getChildren((node) => node.hasName('item'));
    if (!allNodes) return;
    allNodes.forEach((node) => {
      const targetMainNode = mainNodeMap.value[node.id()];
      if (targetMainNode) {
        updateNodeAndMainNodeAttributes(node, targetMainNode);
      }
    });
  };

  const updateKonvaNodeAttribute = (node: Node, attrName: string, value: number) => {
    if (attrName === 'x' || attrName === 'y') {
      switch (attrName) {
        case 'x':
          node.setAttr(attrName, magicFormula(value + adModuleX.value));
          break;
        default:
          node.setAttr(attrName, magicFormula(value + adModuleY.value));
          break;
      }
    } else {
      node.setAttr(attrName, value);
    }
  };

  const updateNodeAndMainNodeAttributes = (node: Node, targetMainNode: MyNode) => {
    const scaleX = magicFormula(node.scaleX());
    const scaleY = magicFormula(node.scaleY());
    const rotation = magicFormula(node.rotation());

    // position
    targetMainNode.x = magicFormula(node.x() - adModuleX.value);
    targetMainNode.y = magicFormula(node.y() - adModuleY.value);
    // transform
    targetMainNode.scaleX = scaleX;
    targetMainNode.scaleY = scaleY;
    targetMainNode.rotation = rotation;
    // opacity
    targetMainNode.opacity = magicFormula(node.opacity());
  };

  const deleteItems = (selectedNodes: Node[]) => {
    selectedNodes.forEach((node) => {
      // 同時移除 mainNodeList
      deleteMainNode(node.id());
      // 同時刪除 TimelineItem
      deleteTimelineTrack(node.id());
      // 刪除 Node(Img)
      node.destroy();
    });
  };

  const deleteMainItem = (selectedNode: Node) => {
    // 同時移除 mainNodeList
    deleteMainNode(selectedNode.id());
    // 同時刪除 TimelineItem
    deleteTimelineTrack(selectedNode.id());
    // 刪除 Node(Img)
    selectedNode.destroy();
    // 更新選取框
    removeNodeFromTransformer(selectedNode);
    // ui 通知
    toastSuccess('已刪除圖層');
  };

  const deleteMainNode = (id: string) => {
    const targetIndex = mainNodeList.value.findIndex((item) => item.id === id);
    if (targetIndex > -1) mainNodeList.value.splice(targetIndex, 1);
  };

  const addImage = (imgObj: HTMLImageElement) => {
    if (mainNodeLength.value >= SOURCE_IMG_LIMIT) {
      toastWarning(`圖層已達上限${SOURCE_IMG_LIMIT}張，請先刪除不要的圖層。`);
      return;
    }
    const id = uid.rnd();
    const imgConfig = {
      id: id,
      name: 'item',
      label: '未命名',
      x: mainItemInitialX.value,
      y: mainItemInitialY.value,
      width: imgObj.naturalWidth,
      height: imgObj.naturalHeight,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1,
      offset: {
        x: imgObj.naturalWidth / 2,
        y: imgObj.naturalHeight / 2
      }
    };
    const imgItem = new Konva.Image({
      ...imgConfig,
      image: imgObj,
      draggable: true
    });
    mainLayer.value?.add(imgItem);
    focusOnItem(imgItem);
    addMainNode(imgItem, imgConfig);
    // 替這張圖片新增 TimelineItem
    addTimelineTrack(imgObj, id);
    updateInitialPosition();
  };

  const changeImage = (node: Node, imgObj: HTMLImageElement) => {
    if (!node) return;
    const imgNode = mainNodeMap.value[node.id()];
    if (!imgNode) return;
    node.attrs.image = imgObj;
    node.width(imgObj.naturalWidth);
    node.height(imgObj.naturalHeight);
    node.offsetX(imgObj.naturalWidth / 2);
    node.offsetY(imgObj.naturalHeight / 2);
    // 更新寬高(因效能問題 updateNodeAndMainNodeAttributes 不會更新寬高)
    imgNode.width = imgObj.naturalWidth;
    imgNode.height = imgObj.naturalHeight;
    // 更新數據
    updateNodeAndMainNodeAttributes(node, imgNode);
  };

  const addMainNode = (imgItem: Konva.Image, imgNode: MyNode) => {
    // console.log(imgItem);
    mainNodeList.value.push(imgNode);
    // 更新數據
    updateNodeAndMainNodeAttributes(imgItem, imgNode);
  };

  const updateInitialPosition = () => {
    mainItemInitialX.value += 10;
    mainItemInitialY.value += 10;
  };

  return {
    // state
    mainStageRef,
    mainStageBgRef,
    stage,
    isClipMode,
    // action
    initKonva,
    destroyKonva,
    addImage,
    changeImage,
    deleteMainItem,
    resetZooming,
    logKonva,
    logKonvaJSON,
    updateKonvaNodeAttribute,
    updateMainNodeState,
    updateNodeAndMainNodeAttributes,
    addLayerClip,
    removeLayerClip
  };
};
