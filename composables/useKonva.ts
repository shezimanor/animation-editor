// Konva: https://konvajs.org/api/Konva.html
import Konva from 'konva';
interface AdModuleConfig {
  width: number;
  height: number;
}

export const useKonva = (adModuleConfig?: AdModuleConfig) => {
  const DELTA = 4;
  const mainStageRef = useState<HTMLDivElement | null>('mainStageRef', () => null);
  const mainStageBgRef = useState<HTMLDivElement | null>('mainStageBgRef', () => null);
  let stage = useState<Konva.Stage | null>('stage', () => null);
  let container = useState<HTMLDivElement | null>('container', () => null);
  let layer = useState<Konva.Layer | null>('layer', () => null);
  let transformer = useState<Konva.Transformer | null>('transformer', () => null);
  let selectionRect = useState<Konva.Rect | null>('selectionRect', () => null);
  let adModuleRect = useState<Konva.Rect | null>('adModuleRect', () => null);
  const selecting = ref(false);
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

    // 註冊 Stage 事件
    if (
      stage.value !== null &&
      transformer.value !== null &&
      selectionRect.value !== null &&
      container.value !== null
    )
      addStageEvents(stage.value, transformer.value, selectionRect.value, container.value);
  };

  // TODO: 清除 Konva
  const destroyKonva = () => {};

  const createStage = () => {
    if (mainStageRef.value) {
      stage.value = new Konva.Stage({
        container: mainStageRef.value,
        width: window.innerWidth - 72, // 減去 aside width
        height: window.innerHeight - 216 // 減去 header height + footer height: , (adModuleConfig?.height || 480) * 4
      });
      container.value = stage.value.container();
      container.value.tabIndex = 1;
      container.value.style.outline = 'none';
      container.value.style.position = 'relative';
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
        // anchor is Konva.Rect instance
        // you manually change its styling
        anchor.cornerRadius(10);
        // 錨點外框線顏色
        anchor.stroke('#6366f1');
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
        // you also can set other properties
        // e.g. you can set fillPatternImage to set icon to the anchor
      }
    });
    layer.value?.add(transformer.value);
  };

  const createAdModuleRect = () => {
    adModuleRect.value = new Konva.Rect({
      fill: 'rgba(220, 220, 220, 0.35)',
      // disable events to not interrupt with events
      width: adModuleConfig?.width || 320,
      height: adModuleConfig?.height || 480,
      // center
      x: stage.value?.getAttr('width') / 2 - (adModuleConfig?.width || 320) / 2,
      y: stage.value?.getAttr('height') / 2 - (adModuleConfig?.height || 480) / 2,
      listening: false
    });
    if (adModuleRect.value) console.log(adModuleRect.value.x(), adModuleRect.value.y());
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
      // if (e.target.getType() !== currentStage.getType()) return;

      e.evt.preventDefault();
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
      // 必須是在按下 ⌘ 時才能縮放
      if (!e.evt.metaKey) return;

      const oldScale = currentStage.scaleX();
      const pointer = currentStage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - currentStage.x()) / oldScale,
        y: (pointer.y - currentStage.y()) / oldScale
      };

      // 決定是 Zoom In or Zoom Out
      let direction = e.evt.deltaY > 0 ? 1 : -1;

      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale
      };

      currentStage.scale({ x: newScale, y: newScale });
      currentStage.position(newPos);
      console.log('new', newPos.x, newPos.y);

      if (mainStageBgRef.value) {
        //  translate(${offsetX}px, ${offsetY}px)
        mainStageBgRef.value.style.transform = `scale(${newScale}) translate(${newPos.x % 16}px, ${newPos.y % 16}px)`;
        mainStageBgRef.value.style.width = `${Number((1 / newScale).toFixed(2)) * 100}%`;
        mainStageBgRef.value.style.height = `${Number((1 / newScale).toFixed(2)) * 100}%`;
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
        selectedNodes.forEach((node) => node.destroy());
        clearTransformer();
        break;
      case 'Escape':
        clearTransformer();
        break;
      case 'ArrowUp':
        selectedNodes.forEach((node) => node.y(node.y() - DELTA));
        break;
      case 'ArrowDown':
        selectedNodes.forEach((node) => node.y(node.y() + DELTA));
        break;
      case 'ArrowLeft':
        selectedNodes.forEach((node) => node.x(node.x() - DELTA));
        break;
      case 'ArrowRight':
        selectedNodes.forEach((node) => node.x(node.x() + DELTA));
        break;
      default:
        break;
    }
  };

  const addImage = (imgObj: HTMLImageElement) => {
    const imgItem = new Konva.Image({
      name: 'item',
      x: newItemInitialX.value,
      y: newItemInitialY.value,
      image: imgObj,
      width: imgObj.naturalWidth,
      height: imgObj.naturalHeight,
      draggable: true
    });
    focusOnItem(imgItem);
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
    addImage,
    addRect
  };
};
