import { gsap } from 'gsap';
import Konva from 'konva';
import type { GroupConfig } from 'konva/lib/Group';
import type { Node, NodeConfig } from 'konva/lib/Node';
import type { ImageConfig } from 'konva/lib/shapes/Image';
console.log('exec useGlobal');
export interface MyNode {
  id: string;
  name: string;
  label: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
}
interface TweenVars {
  x: number;
  y: number;
  width?: number;
  height?: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  ease?: gsap.EaseString | gsap.EaseFunction;
}
export interface FromToTween {
  id: string;
  nodeId: string;
  type: 'tween';
  duration: number;
  start: number;
  fromVars: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    opacity: number;
    rotation: number;
  };
  toVars: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    opacity: number;
    rotation: number;
    ease: gsap.EaseString | gsap.EaseFunction;
  };
}
export interface SetPoint {
  id: string;
  nodeId: string;
  type: 'setPoint';
  start: number;
  vars: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    opacity: number;
    rotation: number;
  };
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
// schema 儲存會用到的 timeline 資訊
const gsapTimelineInfoMap: Record<string, Record<string, FromToTween | SetPoint>> = {};

const { toastSuccess, toastError } = useNotify();

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
  const timelineItemInitialY = ref(0);
  const getTargetNodeFromTimeline = (id: string) => {
    return timelineLayer.value?.findOne(`#${id}`);
  };
  const getTargetTransFormerFromTimeline = (id: string) => {
    return timelineLayer.value?.findOne(`#tf_${id}`);
  };
  const updateTimelineLayer = () => {
    timelineLayer.value?.draw();
  };
  const addRect = (rectConfig: Partial<NodeConfig>) => {
    return new Konva.Rect(rectConfig);
  };
  const addCircle = (circleConfig: Partial<NodeConfig>) => {
    return new Konva.Circle(circleConfig);
  };
  const addImage = (imageConfig: ImageConfig) => {
    return new Konva.Image(imageConfig);
  };
  const addGroup = (groupConfig: GroupConfig) => {
    return new Konva.Group(groupConfig);
  };
  const addTransformer = (barId: string) => {
    // 新增 Transformer
    const newTransformer = new Konva.Transformer({
      id: `tf_${barId}`,
      borderStroke: 'rgba(355, 255, 255, 0.6)',
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
    return newTransformer;
  };
  // 更新起始位置 (用 track 來找)
  const updateTimelineTrackInitialPosition = () => {
    const tracks = timelineLayer.value?.find('.item_track') ?? [];
    timelineItemInitialY.value = tracks.length * (TIMELINE_TRACK_HEIGHT + TIMELINE_TRACK_GAP_Y);
  };
  // 刪除變形器
  const deleteTransformer = (id: string) => {
    const transformer = getTargetTransFormerFromTimeline(id);
    if (transformer && transformer instanceof Konva.Transformer) {
      transformer.visible(false);
      transformer.nodes([]);
      transformer.destroy();
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
      name: 'item_tween_group',
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
      const barItems = groupItem.find('.item_bar');
      for (const barItem of barItems) {
        const barId = barItem.id();
        // 刪除 Bar 的變形器
        deleteTransformer(barId);
      }
      // 刪除 Bar Group
      groupItem.destroy();
      // 更新所有 Bar Group 的位置
      updateTimelineAllItems('.item_tween_group');
    }
    // 更新起始位置
    updateTimelineTrackInitialPosition();
  };
  // 建立動畫條(動畫單元)
  const addTimelineBar = (id: string, duration: number, start: number) => {
    const groupItem = getTargetNodeFromTimeline(`group_${id}`);
    if (!groupItem || !(groupItem instanceof Konva.Group)) return '';
    const barId = `bar_${uid.rnd()}_${id}`;
    const trackWidth =
      window.innerWidth - TIMELINE_TRACK_WIDTH_SUBTRACTION - TIMELINE_TRACK_START_X;
    const barInitialX = trackWidth * (start / TOTAL_DURATION);
    const barInitialWidth = trackWidth * (duration / TOTAL_DURATION);
    // 動畫條實體
    const barItem = addRect({
      id: barId,
      // 不要加 item_tween_active, 讓  activateNode() 裡面處理
      name: `item_bar item_tween`,
      // 這裡的 x,y 位置是相對於 group 的位置
      x: barInitialX,
      y: 0,
      width: barInitialWidth,
      height: TIMELINE_TRACK_HEIGHT,
      fill: TIMELINE_NODE_ACTIVE_COLOR,
      cornerRadius: 0,
      draggable: true,
      dragBoundFunc(pos) {
        // console.log('pos.x', pos.x);
        return {
          x:
            pos.x < TIMELINE_TRACK_START_X
              ? TIMELINE_TRACK_START_X
              : pos.x + this.width() >
                  window.innerWidth -
                    TIMELINE_TRACK_WIDTH_SUBTRACTION -
                    TIMELINE_TRACK_START_X +
                    TIMELINE_TRACK_START_X
                ? window.innerWidth -
                  TIMELINE_TRACK_WIDTH_SUBTRACTION -
                  TIMELINE_TRACK_START_X -
                  this.width() +
                  TIMELINE_TRACK_START_X
                : pos.x,
          y: this.absolutePosition().y
        };
      }
    });
    // 事件監聽
    barItem.on('click', function () {
      // 單擊動畫條
      activateNode(id, barId, barItem);
      console.log('barItem click');
      const time = getTimeByNodeX(barItem.x());
      updateCurrentTime(time);
      seekGsapTimeline(time);
    });
    barItem.on('dblclick', function () {
      // 雙擊動畫條
      console.log('barItem dblclick');
      const time = getTimeByNodeX(barItem.x() + barItem.width());
      updateCurrentTime(time);
      seekGsapTimeline(time);
    });
    let isDragging = false;
    barItem.on('dragstart', function () {
      activateNode(id, barId, barItem);
      isDragging = true;
    });
    barItem.on('dragend', function () {
      isDragging = false;
      // console.log('barItem.x():', barItem.x());
      // 動畫的 start 發生變化
      const targetMainNode = mainNodeMap.value[id];
      const targetNode = getTargetNodeFromMain(id);
      const oldTween = getTween(id, barId);
      if (!targetMainNode || !targetNode || !oldTween) return;
      updateGsapTimelineByTween(oldTween, barItem, targetMainNode, targetNode, 'start');
    });
    barItem.on('dragmove', function () {
      if (!isDragging) return;
      // console.log(barItem.x());
    });
    // 設定 currentActiveTimelineNodeId
    currentActiveTimelineNodeId.value = barId;
    // 加入到 groupItem
    groupItem.add(barItem);
    // 加上變形器
    const transformerItem = addTransformer(barId);
    // 快取 barItem 的 x 位置
    let cacheX = barInitialX;
    // 維持 scaleX = 1, 並將 width 設為原本的 scaleX * width
    transformerItem.on('transformstart', function () {
      activateNode(id, barId, barItem);
      cacheX = barItem.x();
    });
    transformerItem.on('transform', function () {
      const currentBar = transformerItem.nodes()[0] as Konva.Rect;
      currentBar.width(currentBar.scaleX() * currentBar.width());
      currentBar.scaleX(1);
      // 修正 x 會因為 scaleX 變動而改變的問題
      if (currentBar.x() !== cacheX) currentBar.x(cacheX);
    });
    transformerItem.on('transformend', function () {
      const currentBar = transformerItem.nodes()[0] as Konva.Rect;
      // 動畫的 duration 發生變化
      const targetMainNode = mainNodeMap.value[id];
      const targetNode = getTargetNodeFromMain(id);
      const oldTween = getTween(id, barId);
      if (!targetMainNode || !targetNode || !oldTween) return;
      updateGsapTimelineByTween(oldTween, currentBar, targetMainNode, targetNode, 'duration');
    });
    transformerItem.nodes([barItem]);
    // highlight
    activateNode(id, barId, barItem);
    // 回傳 barId, transformer
    return barId;
  };
  // 建立節點(動畫單元)
  const addTimelineCircle = (id: string, start: number): string => {
    const groupItem = getTargetNodeFromTimeline(`group_${id}`);
    if (!groupItem || !(groupItem instanceof Konva.Group)) return '';
    const circleId = `circle_${uid.rnd()}_${id}`;
    const trackWidth =
      window.innerWidth - TIMELINE_TRACK_WIDTH_SUBTRACTION - TIMELINE_TRACK_START_X;
    const circleInitialX = trackWidth * (start / TOTAL_DURATION);
    // 節點實體
    const circleItem = addCircle({
      id: circleId,
      // 不要加 item_tween_active, 讓  activateNode() 裡面處理
      name: `item_circle item_tween`,
      // 這裡的 x,y 位置是相對於 group 的位置
      x: circleInitialX,
      y: TIMELINE_TRACK_HEIGHT / 2,
      radius: TIMELINE_TRACK_HEIGHT / 4,
      fill: TIMELINE_NODE_ACTIVE_COLOR,
      cornerRadius: 0,
      draggable: true,
      dragBoundFunc(pos) {
        return {
          x:
            pos.x < TIMELINE_TRACK_START_X
              ? TIMELINE_TRACK_START_X
              : pos.x > trackWidth + TIMELINE_TRACK_START_X
                ? trackWidth + TIMELINE_TRACK_START_X
                : pos.x,
          y: this.absolutePosition().y
        };
      }
    });
    // 事件監聽
    circleItem.on('click', function () {
      // 單擊動畫條
      activateNode(id, circleId, circleItem);
      console.log('circleItem click');
      const time = getTimeByNodeX(circleItem.x());
      updateCurrentTime(time);
      seekGsapTimeline(time);
    });
    let isDragging = false;
    circleItem.on('dragstart', function () {
      activateNode(id, circleId, circleItem);
      isDragging = true;
    });
    circleItem.on('dragend', function () {
      isDragging = false;
      console.log('circleItem.x():', circleItem.x());
      // 動畫的 start 發生變化
      const targetMainNode = mainNodeMap.value[id];
      const targetNode = getTargetNodeFromMain(id);
      const oldTween = getTween(id, circleId);
      if (!targetMainNode || !targetNode || !oldTween) return;
      updateGsapTimelineBySetPoint(oldTween, circleItem, targetMainNode, targetNode, 'start');
    });
    // 加入到 groupItem
    groupItem.add(circleItem);
    // highlight
    activateNode(id, circleId, circleItem);
    // 回傳 circleId
    return circleId;
  };
  // 顯目當前動畫單元
  const activateNode = (
    mainId: string,
    nodeItemId: string,
    nodeItem: Konva.Rect | Konva.Circle
  ) => {
    console.log('activateNode');
    // highlight active bar
    inactivateNode();
    nodeItem.fill(TIMELINE_NODE_ACTIVE_COLOR);
    if (nodeItem instanceof Konva.Rect) {
      nodeItem.name('item_bar item_tween item_tween_active');
    } else if (nodeItem instanceof Konva.Circle) {
      nodeItem.name('item_circle item_tween item_tween_active');
    }
    // 設定 currentActiveTimelineNodeId
    currentActiveTimelineNodeId.value = nodeItemId;
    // 選取到主畫布的素材
    selectTargetNodeFromMain(mainId);
  };
  // 移除動畫單元的顯目顯示
  const inactivateNode = () => {
    console.log('inactivateNode');
    const activeNode = timelineLayer.value?.findOne('.item_tween_active');
    if (activeNode && activeNode instanceof Konva.Rect) {
      activeNode.fill(TIMELINE_NODE_COLOR);
      activeNode.name('item_bar item_tween');
    } else if (activeNode && activeNode instanceof Konva.Circle) {
      activeNode.fill(TIMELINE_NODE_COLOR);
      activeNode.name('item_circle item_tween');
    }
    // 設定 currentActiveTimelineNodeId
    currentActiveTimelineNodeId.value = null;
  };
  const updateGsapTimelineByTween = (
    oldTween: GSAPTween,
    targetBarNode: Node,
    targetMainNode: MyNode,
    targetNode: Node,
    updateName: 'fromVars' | 'toVars' | 'duration' | 'start' | 'ease',
    newEase: gsap.EaseString | gsap.EaseFunction = 'none'
  ) => {
    if (!gsapTimeline) return;
    const {
      x: fromX,
      y: fromY,
      scaleX: fromScaleX,
      scaleY: fromScaleY,
      rotation: fromRotation,
      opacity: fromOpacity
    } = oldTween.vars.startAt as TweenVars;
    const {
      x: toX,
      y: toY,
      scaleX: toScaleX,
      scaleY: toScaleY,
      rotation: toRotation,
      opacity: toOpacity,
      ease: toEase
    } = oldTween.vars as TweenVars;
    const {
      x: newX,
      y: newY,
      scaleX: newScaleX,
      scaleY: newScaleY,
      rotation: newRotation,
      opacity: newOpacity
    } = targetMainNode;
    let fromVars =
      updateName === 'fromVars'
        ? {
            x: newX + adModuleX.value,
            y: newY + adModuleY.value,
            scaleX: newScaleX,
            scaleY: newScaleY,
            rotation: newRotation,
            opacity: newOpacity
          }
        : {
            x: fromX,
            y: fromY,
            scaleX: fromScaleX,
            scaleY: fromScaleY,
            rotation: fromRotation,
            opacity: fromOpacity
          };
    let toVars =
      updateName === 'toVars'
        ? {
            x: newX + adModuleX.value,
            y: newY + adModuleY.value,
            scaleX: newScaleX,
            scaleY: newScaleY,
            rotation: newRotation,
            opacity: newOpacity,
            ease: toEase
          }
        : updateName === 'ease'
          ? {
              x: toX,
              y: toY,
              scaleX: toScaleX,
              scaleY: toScaleY,
              rotation: toRotation,
              opacity: toOpacity,
              ease: newEase
            }
          : {
              x: toX,
              y: toY,
              scaleX: toScaleX,
              scaleY: toScaleY,
              rotation: toRotation,
              opacity: toOpacity,
              ease: toEase
            };
    const duration = getDurationByBarWidth(targetBarNode.width());
    const start = getTimeByNodeX(targetBarNode.x());

    const nodeId = targetNode.id();
    const barId = targetBarNode.id();
    // 移除原本的 oldTween
    removeGSAPTween(oldTween);
    // 重新建立新的 Tween
    const newTween = addFromToTween(targetNode, duration, start, fromVars, toVars);

    if (newTween) {
      // 儲存新的 Tween 到 gsapTimelineNodeTweenMap 裡面
      gsapTimelineNodeTweenMap[nodeId][barId] = newTween;
      // 儲存新的 Tween 資訊到 gsapTimelineInfoMap 裡面
      gsapTimelineInfoMap[nodeId][barId] = {
        ...gsapTimelineInfoMap[nodeId][barId],
        duration,
        start,
        fromVars,
        toVars
      } as FromToTween;
    }

    switch (updateName) {
      case 'fromVars':
        toastSuccess('已更新初始點');
        break;
      case 'toVars':
        toastSuccess('已更新結尾點');
        break;
      case 'ease':
        toastSuccess('已更新 Ease');
        break;
      default:
        break;
    }
  };
  const updateGsapTimelineBySetPoint = (
    oldTween: GSAPTween,
    targetCircleNode: Node,
    targetMainNode: MyNode,
    targetNode: Node,
    updateName: 'vars' | 'start'
  ) => {
    if (!gsapTimeline) return;
    const {
      x: originalX,
      y: originalY,
      scaleX: originalScaleX,
      scaleY: originalScaleY,
      rotation: originalRotation,
      opacity: originalOpacity
    } = oldTween.vars as TweenVars;
    const {
      x: newX,
      y: newY,
      scaleX: newScaleX,
      scaleY: newScaleY,
      rotation: newRotation,
      opacity: newOpacity
    } = targetMainNode;
    let tweenVars =
      updateName === 'vars'
        ? {
            x: newX + adModuleX.value,
            y: newY + adModuleY.value,
            scaleX: newScaleX,
            scaleY: newScaleY,
            rotation: newRotation,
            opacity: newOpacity
          }
        : {
            x: originalX,
            y: originalY,
            scaleX: originalScaleX,
            scaleY: originalScaleY,
            rotation: originalRotation,
            opacity: originalOpacity
          };
    const start = getTimeByNodeX(targetCircleNode.x());
    const nodeId = targetNode.id();
    const circleId = targetCircleNode.id();
    // 移除原本的 oldTween
    removeGSAPTween(oldTween);
    // 重新建立新的 Tween
    const newTween = addZeroDurationTween(targetNode, start, tweenVars);

    if (newTween) {
      // 儲存新的 Tween 到 gsapTimelineNodeTweenMap 裡面
      gsapTimelineNodeTweenMap[nodeId][circleId] = newTween;
      // 儲存新的 Tween 資訊到 gsapTimelineInfoMap 裡面
      gsapTimelineInfoMap[nodeId][circleId] = {
        ...gsapTimelineInfoMap[nodeId][circleId],
        start,
        vars: tweenVars
      } as SetPoint;
    }

    switch (updateName) {
      case 'vars':
        toastSuccess('已更新節點');
        break;
      default:
        break;
    }
  };
  // 更新 fromTo 動畫(by resize window)
  const updateGsapTimelineByTween2 = (
    oldTween: GSAPTween,
    targetBarNode: Node,
    targetNode: Node,
    diffX: number,
    diffY: number
  ) => {
    if (!gsapTimeline) return;
    const {
      x: fromX,
      y: fromY,
      scaleX: fromScaleX,
      scaleY: fromScaleY,
      rotation: fromRotation,
      opacity: fromOpacity
    } = oldTween.vars.startAt as TweenVars;
    const {
      x: toX,
      y: toY,
      scaleX: toScaleX,
      scaleY: toScaleY,
      rotation: toRotation,
      opacity: toOpacity,
      ease: toEase
    } = oldTween.vars as TweenVars;

    let fromVars = {
      x: fromX + diffX,
      y: fromY + diffY,
      scaleX: fromScaleX,
      scaleY: fromScaleY,
      rotation: fromRotation,
      opacity: fromOpacity
    };
    let toVars = {
      x: toX + diffX,
      y: toY + diffY,
      scaleX: toScaleX,
      scaleY: toScaleY,
      rotation: toRotation,
      opacity: toOpacity,
      ease: toEase
    };
    const duration = getDurationByBarWidth(targetBarNode.width());
    const start = getTimeByNodeX(targetBarNode.x());
    const nodeId = targetNode.id();
    const barId = targetBarNode.id();
    // 移除原本的 oldTween
    removeGSAPTween(oldTween);
    // 重新建立新的 Tween
    const newTween = addFromToTween(targetNode, duration, start, fromVars, toVars);

    if (newTween) {
      // 儲存新的 Tween 到 gsapTimelineNodeTweenMap 裡面
      gsapTimelineNodeTweenMap[nodeId][barId] = newTween;
      // 儲存新的 Tween 資訊到 gsapTimelineInfoMap 裡面
      gsapTimelineInfoMap[nodeId][barId] = {
        ...gsapTimelineInfoMap[nodeId][barId],
        duration,
        start,
        fromVars,
        toVars
      } as FromToTween;
    }
  };
  // 更新 set 動畫(by resize window)
  const updateGsapTimelineBySetPoint2 = (
    oldTween: GSAPTween,
    targetCircleNode: Node,
    targetNode: Node,
    diffX: number,
    diffY: number
  ) => {
    if (!gsapTimeline) return;
    const {
      x: originalX,
      y: originalY,
      scaleX: originalScaleX,
      scaleY: originalScaleY,
      rotation: originalRotation,
      opacity: originalOpacity
    } = oldTween.vars as TweenVars;
    let tweenVars = {
      x: originalX + diffX,
      y: originalY + diffY,
      scaleX: originalScaleX,
      scaleY: originalScaleY,
      rotation: originalRotation,
      opacity: originalOpacity
    };
    const start = getTimeByNodeX(targetCircleNode.x());
    const nodeId = targetNode.id();
    const circleId = targetCircleNode.id();
    // 移除原本的 oldTween
    removeGSAPTween(oldTween);
    // 重新建立新的 Tween
    const newTween = addZeroDurationTween(targetNode, start, tweenVars);

    if (newTween) {
      // 儲存新的 Tween 到 gsapTimelineNodeTweenMap 裡面
      gsapTimelineNodeTweenMap[nodeId][circleId] = newTween;
      // 儲存新的 Tween 資訊到 gsapTimelineInfoMap 裡面
      gsapTimelineInfoMap[nodeId][circleId] = {
        ...gsapTimelineInfoMap[nodeId][circleId],
        start,
        vars: tweenVars
      } as SetPoint;
    }
  };
  const updateAllTweenPosition = (diffX: number = 0, diffY: number = 0) => {
    // 取得所有的 tween in gsapTimelineNodeTweenMap
    for (const nodeId in gsapTimelineNodeTweenMap) {
      const nodeTweenMap = gsapTimelineNodeTweenMap[nodeId];
      for (const timelineNodeId in nodeTweenMap) {
        const tween = nodeTweenMap[timelineNodeId];
        const targetNode = getTargetNodeFromMain(nodeId);
        const targetTimelineNode = getTargetNodeFromTimeline(timelineNodeId);
        if (!targetNode || !targetTimelineNode) continue;
        if (timelineNodeId.startsWith('bar_')) {
          updateGsapTimelineByTween2(tween, targetTimelineNode, targetNode, diffX, diffY);
        } else if (timelineNodeId.startsWith('circle_')) {
          updateGsapTimelineBySetPoint2(tween, targetTimelineNode, targetNode, diffX, diffY);
        }
      }
    }
  };
  const getTween = (nodeId: string, timelineNodeId: string) => {
    console.log('getTween');
    return gsapTimelineNodeTweenMap[nodeId][timelineNodeId];
  };
  const getTweenEase = (nodeId: string, timelineNodeId: string) => {
    console.log('getTweenEase');
    return gsapTimelineNodeTweenMap[nodeId][timelineNodeId].vars.ease;
  };
  const removeGSAPTween = (tween: GSAPTween) => {
    console.log('removeGSAPTween');
    // gsapTimeline.remove 可刪除 .fromTo() 和 .set()
    gsapTimeline?.remove(tween);
  };
  const createTween = (targetNode: Node) => {
    // console.log('createTween');
    const nodeId = targetNode.id();
    const duration = 1; // TODO: 可能會因為其他已存在的動畫影響位置
    const start = currentTime.value; //  使用時間軸當前指向的時間（暫時先無視其他動畫）TODO: 需要考慮該時間是否已有其他動畫
    // 先建立時間為 1 秒的空動畫
    const { tween, tweenVars } = addInitialTween(targetNode, duration, start);
    // 加入對應的時間軸動畫條(動畫條 ID 會回傳)
    const barId = addTimelineBar(nodeId, duration, start);
    if (!barId || !tween || !tweenVars) return toastError('動畫建立失敗');
    // 儲存 Tween 到 gsapTimelineNodeTweenMap 裡面
    if (!gsapTimelineNodeTweenMap[nodeId]) gsapTimelineNodeTweenMap[nodeId] = {};
    gsapTimelineNodeTweenMap[nodeId][barId] = tween;
    // 儲存 Tween 資訊到 gsapTimelineInfoMap 裡面
    if (!gsapTimelineInfoMap[nodeId]) gsapTimelineInfoMap[nodeId] = {};
    gsapTimelineInfoMap[nodeId][barId] = {
      id: barId,
      nodeId,
      type: 'tween',
      duration,
      start,
      fromVars: tweenVars,
      toVars: { ...tweenVars, ease: 'none' }
    };
    // console.log('建立動畫:', tween);
    toastSuccess('動畫已建立');
  };
  const createSetPoint = (targetNode: Node) => {
    // console.log('createSetPoint');
    const nodeId = targetNode.id();
    const start = currentTime.value; // 使用當前時間
    // 先建立時間為 1 秒的空動畫, TODO: start 需要考慮其他因素, duration 也會有相關限制
    const { tween, tweenVars } = addSetPoint(targetNode, start);
    // 加入對應的時間軸動畫條(動畫條 ID 會回傳)
    const pointId = addTimelineCircle(nodeId, start);
    if (!pointId || !tween || !tweenVars) return toastError('節點建立失敗');
    // 儲存 Tween 到 gsapTimelineNodeTweenMap 裡面
    if (!gsapTimelineNodeTweenMap[nodeId]) gsapTimelineNodeTweenMap[nodeId] = {};
    gsapTimelineNodeTweenMap[nodeId][pointId] = tween;
    // 儲存 Tween 資訊到 gsapTimelineInfoMap 裡面
    if (!gsapTimelineInfoMap[nodeId]) gsapTimelineInfoMap[nodeId] = {};
    gsapTimelineInfoMap[nodeId][pointId] = {
      id: pointId,
      nodeId,
      type: 'setPoint',
      start,
      vars: tweenVars
    };
    // console.log('建立節點:', tween);
    toastSuccess('節點已建立');
  };
  // deleteTween & deleteSetPoint 刪除邏輯相同，共用函數
  const deleteTweenAndSetPoint = (targetNode: Node, timelineNode: Node, isBar: Boolean) => {
    const nodeId = targetNode.id();
    const timelineNodeId = timelineNode.id();
    const tween = getTween(nodeId, timelineNodeId);
    const gsapTimelineNodeTweenMapTargetMap = gsapTimelineNodeTweenMap[nodeId];
    const gsapTimelineInfoMapTargetMap = gsapTimelineInfoMap[nodeId];
    // 刪除 GSAP 動畫
    removeGSAPTween(tween);
    // 刪除 Tween from gsapTimelineNodeTweenMap
    if (gsapTimelineNodeTweenMapTargetMap.hasOwnProperty(timelineNodeId))
      delete gsapTimelineNodeTweenMapTargetMap[timelineNodeId];
    // 刪除 Tween 資訊 from gsapTimelineInfoMap
    if (gsapTimelineInfoMapTargetMap.hasOwnProperty(timelineNodeId))
      delete gsapTimelineInfoMapTargetMap[timelineNodeId];
    // 刪除 bar 的 Transformer
    if (isBar) {
      deleteTransformer(timelineNodeId);
    }
    // 刪除時間軸動畫條、節點
    timelineNode.destroy();
    // 設定 currentActiveTimelineNodeId
    currentActiveTimelineNodeId.value = null;
    return true;
  };
  const deleteTween = (targetNode: Node, timelineNode: Node) => {
    const result = deleteTweenAndSetPoint(targetNode, timelineNode, true);
    if (result) toastSuccess('動畫已刪除');
    else toastError('動畫刪除失敗');
  };

  const deleteSetPoint = (targetNode: Node, timelineNode: Node) => {
    const result = deleteTweenAndSetPoint(targetNode, timelineNode, false);
    if (result) toastSuccess('節點已刪除');
    else toastError('節點刪除失敗');
  };
  // 建立一個 fromTo() 狀態相同的不變動畫
  const addInitialTween = (targetNode: Node, duration: number, start: number) => {
    const id = targetNode.id();
    const targetMainNode = mainNodeMap.value[id]; // 響應式 Node
    if (!targetMainNode) return { tween: null, tweenVars: null };
    const { scaleX, scaleY, x, y, rotation, opacity } = targetMainNode;
    const tweenVars = {
      x: x + adModuleX.value,
      y: y + adModuleY.value,
      scaleX,
      scaleY,
      rotation,
      opacity
    };
    const tween = addFromToTween(targetNode, duration, start, tweenVars, {
      ...tweenVars,
      ease: 'none'
    });
    return { tween, tweenVars };
  };
  // 建立一個 set() in GSAP timeline
  const addSetPoint = (targetNode: Node, start: number) => {
    const id = targetNode.id();
    const targetMainNode = mainNodeMap.value[id]; // 響應式 Node
    if (!targetMainNode) return { tween: null, tweenVars: null };
    const { scaleX, scaleY, x, y, rotation, opacity } = targetMainNode;
    const tweenVars = {
      x: x + adModuleX.value,
      y: y + adModuleY.value,
      scaleX,
      scaleY,
      rotation,
      opacity
    };
    const tween = addZeroDurationTween(targetNode, start, tweenVars);
    return { tween, tweenVars };
  };
  // 建立新的 Tween
  const addFromToTween = (
    targetNode: Node,
    duration: number,
    start: number,
    fromVars: TweenVars,
    toVars: TweenVars
  ) => {
    if (!gsapTimeline || !targetNode) return null;
    const tween = gsap.fromTo(
      targetNode,
      { ...fromVars },
      {
        duration,
        immediateRender: false,
        ...toVars
      }
    );
    gsapTimeline?.add(tween, start);
    return tween;
  };
  // 建立新的 zero-duration tween: https://gsap.com/docs/v3/GSAP/Timeline/set()
  const addZeroDurationTween = (targetNode: Node, start: number, tweenVars: TweenVars) => {
    if (!gsapTimeline || !targetNode) return null;
    const tween = gsap.set(targetNode, { ...tweenVars });
    gsapTimeline?.add(tween, start);
    return tween;
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
    console.log('gsapTimelineInfoMap: ', gsapTimelineInfoMap);
  };
  const createGsapTimeline = () => {
    // 因為這個工具的 gsapTimeline 只有一個，所以程式執行時就會存在，這邊的 createGsapTimeline 只用來新增事件和設定結尾點
    // 設定 onUpdate
    gsapTimeline.eventCallback('onUpdate', () => {
      // console.log('onUpdate');
      // 更新 currentTime
      const time = gsapTimeline.time();
      currentTime.value = time;
      // 更新主畫布
      updateMainLayer();
      updateTimelineLayer();
    });
    // 設置一個結尾點，讓 timescale 維持 1（每次有新動畫就要更新）
    // 自定義 gsap 時間軸的結尾
    gsapTimeline?.set(gsapHiddenNode, { x: 0 }, TOTAL_DURATION);
    initializedGsap.value = true;
  };

  // current id
  const currentNodeId = useState<string | null>('currentNodeId', () => null);
  const currentActiveTimelineNodeId = useState<string | null>(
    'currentActiveTimelineNodeId',
    () => null
  );
  // 用來確認 active 的動畫是否屬於當前的素材節點
  // current timelineNode
  const currentTimelineNode = computed(() => {
    if (!currentActiveTimelineNodeId.value) return null;
    return getTargetNodeFromTimeline(`${currentActiveTimelineNodeId.value}`) || null;
  });
  const timelineNodeType = computed(() => {
    if (!currentActiveTimelineNodeId.value) return '';
    if (currentActiveTimelineNodeId.value.indexOf('bar_') === 0) return 'bar';
    else if (currentActiveTimelineNodeId.value.indexOf('circle_') === 0) return 'circle';
    return '';
  });

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
    updateTimelineLayer, // method

    // 時間軸物件
    addTimelineTrack, // method
    deleteTimelineTrack, // method
    activateNode, // method
    inactivateNode, // method
    getTargetNodeFromTimeline, // method
    getTargetTransFormerFromTimeline, // method
    getTween, // method
    getTweenEase, // method
    createTween, // method
    createSetPoint, // method
    removeGSAPTween, // method (just call gsap method)
    deleteTween, // method (more complex method)
    deleteSetPoint, // method
    updateGsapTimelineByTween, // method
    updateGsapTimelineBySetPoint, // method
    updateAllTweenPosition, // method
    addRect, // method
    addImage, // method
    addGroup, // method
    addTransformer, // method

    // gsap
    gsapTimeline, // 原生物件
    gsapTimelineNodeTweenMap, // 原生物件
    gsapTimelineInfoMap, // 原生物件
    initializedGsap, // state
    paused, // state
    currentTime, // state
    updateCurrentTime, // method
    seekGsapTimeline,
    logGsapTimeline, // method
    createGsapTimeline, // method

    // current id
    currentNodeId,
    currentActiveTimelineNodeId,
    currentTimelineNode,
    timelineNodeType
  };
};
