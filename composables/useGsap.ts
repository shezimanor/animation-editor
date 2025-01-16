console.log('exec useGsap');

import { gsap } from 'gsap';
import Konva from 'konva';
import { v4 as uuid } from 'uuid';
import type { Node } from 'konva/lib/Node';
import type { MyNode } from './useGlobal';
interface TweenVars {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  opacity?: number;
  rotation?: number;
  ease?: string;
}

const {
  gsapTimeline,
  adModuleX,
  adModuleY,
  mainNodeMap,
  getTargetNodeFromMain,
  initializedGsap,
  paused,
  gsapTimelineNodeTweenMap,
  currentActiveBarId,
  timelineLayer,
  getTargetNodeFromTimeline,
  addRect,
  addTransformer,
  selectTargetNodeFromMain
} = useGlobal();

export const useGsap = () => {
  const playGsapTimeline = () => {
    gsapTimeline?.play(0);
    paused.value = false;
  };

  const pauseGsapTimeline = (callback?: Function) => {
    gsapTimeline?.pause();
    paused.value = true;
    // 更新所有 Konva 節點狀態
    callback && callback();
  };

  const getTimelineDuration = () => {
    return gsapTimeline?.duration() || 0;
  };

  const addTimelineBar = (id: string, duration: number, start: number): string => {
    const groupItem = getTargetNodeFromTimeline(`group_${id}`);
    if (!groupItem || !(groupItem instanceof Konva.Group)) return '';
    const barId = `bar_${uuid()}_${id}`;
    const trackWidth =
      window.innerWidth - TIMELINE_TRACK_WIDTH_SUBTRACTION - TIMELINE_TRACK_START_X;
    const barInitialX = trackWidth * (start / TOTAL_DURATION);
    const barInitialWidth = trackWidth * (duration / TOTAL_DURATION);
    // 移除其他 bar 的顯目顯示
    removeActiveBarHighLight();
    // 時間軸動畫條(直接醒目顯示)
    const barItem = addRect({
      id: barId,
      name: `item_bar item_bar_active`,
      // 這裡的 x,y 位置是相對於 group 的位置
      x: barInitialX,
      y: 0,
      width: barInitialWidth,
      height: TIMELINE_TRACK_HEIGHT,
      fill: TIMELINE_BAR_ACTIVE_COLOR,
      cornerRadius: 0,
      draggable: true,
      dragBoundFunc(pos) {
        return {
          x:
            pos.x < TIMELINE_TRACK_START_X
              ? TIMELINE_TRACK_START_X
              : pos.x + this.width() > trackWidth
                ? trackWidth - this.width()
                : pos.x,
          y: this.absolutePosition().y
        };
      }
    });
    // 事件監聽
    barItem.on('click', function () {
      // 單擊動畫條
      if (barId !== currentActiveBarId.value) {
        activeBar(id, barId, barItem);
      }
    });
    barItem.on('dblclick', function () {
      // 雙擊動畫條
      if (barId !== currentActiveBarId.value) {
        activeBar(id, barId, barItem);
      }
    });
    let isDragging = false;
    barItem.on('dragstart', function () {
      isDragging = true;
    });
    barItem.on('dragend', function () {
      isDragging = false;
      console.log('barItem.x():', barItem.x());
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
    // 設定 currentActiveBarId
    currentActiveBarId.value = barId;
    // 加入到 groupItem
    groupItem.add(barItem);
    // 加上變形器
    const transformerItem = addTransformer();
    // 快取 barItem 的 x 位置
    let cacheX = barInitialX;
    // 維持 scaleX = 1, 並將 width 設為原本的 scaleX * width
    transformerItem.on('transformstart', function () {
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
    // 回傳 barId
    return barId;
  };

  // 顯目當前動畫條
  const activeBar = (sourceId: string, barId: string, barItem: Konva.Rect) => {
    // highlight active bar
    removeActiveBarHighLight();
    barItem.fill(TIMELINE_BAR_ACTIVE_COLOR);
    barItem.name('item_bar item_bar_active');
    // 設定 currentActiveBarId
    currentActiveBarId.value = barId;
    // 選取到主畫布的素材
    selectTargetNodeFromMain(sourceId);
  };

  // 移除動畫條的顯目顯示
  const removeActiveBarHighLight = () => {
    const activeBar = timelineLayer.value?.findOne('.item_bar_active');
    if (activeBar && activeBar instanceof Konva.Rect) {
      activeBar.fill(TIMELINE_BAR_COLOR);
      activeBar.name('item_bar');
    }
  };

  const removeTween = (tween: GSAPTween) => {
    console.log('removeTween');
    gsapTimeline?.remove(tween);
  };

  const getTween = (nodeId: string, barId: string) => {
    console.log('getTween');
    return gsapTimelineNodeTweenMap[nodeId][barId];
  };

  const createTween = (targetNode: Node, label: string) => {
    console.log('createTween');
    const nodeId = targetNode.id();
    const duration = 1;
    const start = 0;
    // 先建立時間為 1 秒的空動畫, TODO: start 需要考慮其他因素, duration 也會有相關限制
    const tween = addEmptyTween(targetNode, duration, start);
    // 加入對應的時間軸動畫條(動畫條 ID 會回傳)
    const barId = addTimelineBar(nodeId, duration, start);
    if (!barId || !tween) return 'Animation failed';
    // 儲存 Tween 到 gsapTimelineNodeTweenMap 裡面
    if (!gsapTimelineNodeTweenMap[nodeId]) gsapTimelineNodeTweenMap[nodeId] = {};
    gsapTimelineNodeTweenMap[nodeId][barId] = tween;

    return 'Animation created';
  };

  // 建立一個 from,to 狀態相同的不變動畫
  const addEmptyTween = (targetNode: Node, duration: number, start: number) => {
    const id = targetNode.id();
    const targetMainNode = mainNodeMap.value[id]; // 響應式 Node
    if (!targetMainNode) return;
    const { width, height, x, y, rotation, opacity } = targetMainNode;
    const tweenVars = {
      x: x + adModuleX.value,
      y: y + adModuleY.value,
      width,
      height,
      opacity,
      rotation
    };
    const tween = addTween(targetNode, duration, start, tweenVars, {
      ...tweenVars,
      ease: 'none'
    });
    return tween;
  };

  // 建立新的 Tween
  const addTween = (
    targetNode: Node,
    duration: number,
    start: number,
    fromVars: TweenVars,
    toVars: TweenVars
  ) => {
    console.log(duration, start);
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

  const updateGsapTimelineByTween = (
    oldTween: GSAPTween,
    targetBarNode: Node,
    targetMainNode: MyNode,
    targetNode: Node,
    updateName: 'fromVars' | 'toVars' | 'duration' | 'start'
  ) => {
    if (!gsapTimeline) return;
    const {
      width: fromWidth,
      height: fromHeight,
      x: fromX,
      y: fromY,
      rotation: fromRotation,
      opacity: fromOpacity
    } = oldTween.vars.startAt as TweenVars;
    const {
      width: toWidth,
      height: toHeight,
      x: toX,
      y: toY,
      rotation: toRotation,
      opacity: toOpacity
    } = oldTween.vars as TweenVars;
    const {
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY,
      rotation: newRotation,
      opacity: newOpacity
    } = targetMainNode;
    let fromVars =
      updateName === 'fromVars'
        ? {
            width: newWidth,
            height: newHeight,
            x: newX + adModuleX.value,
            y: newY + adModuleY.value,
            rotation: newRotation,
            opacity: newOpacity
          }
        : {
            width: fromWidth,
            height: fromHeight,
            x: fromX,
            y: fromY,
            rotation: fromRotation,
            opacity: fromOpacity
          };
    let toVars =
      updateName === 'toVars'
        ? {
            width: newWidth,
            height: newHeight,
            x: newX + adModuleX.value,
            y: newY + adModuleY.value,
            rotation: newRotation,
            opacity: newOpacity,
            ease: 'none'
          }
        : {
            width: toWidth,
            height: toHeight,
            x: toX,
            y: toY,
            rotation: toRotation,
            opacity: toOpacity,
            ease: 'none'
          };
    const duration = getDurationByBarWidth(targetBarNode.width());
    const start = getTimeByBarX(targetBarNode.x());
    // console.log('fromVars:', fromVars);
    // console.log('toVars:', toVars);

    const nodeId = targetNode.id();
    const barId = targetBarNode.id();
    // 移除原本的 oldTween
    removeTween(oldTween);
    // 重新建立新的 Tween
    const newTween = addTween(targetNode, duration, start, fromVars, toVars);

    // 儲存新的 Tween 到 gsapTimelineNodeTweenMap 裡面
    if (newTween) gsapTimelineNodeTweenMap[nodeId][barId] = newTween;

    return 'Animation updated';
  };
  // test functions
  const logTimeline = (targetNode: Node, barId: string) => {
    if (!gsapTimeline) return null;
    const nodeId = targetNode.id();
    const tweenObj = gsapTimelineNodeTweenMap[nodeId][barId];
  };

  return {
    // state
    initializedGsap,
    paused,
    gsapTimelineNodeTweenMap,
    // action
    createTween,
    removeTween,
    getTween,
    playGsapTimeline,
    pauseGsapTimeline,
    getTimelineDuration,
    logTimeline,
    updateGsapTimelineByTween
  };
};
