```typescript
// test
const addEmptyTween2 = (targetNode: Node, duration: number, start: number) => {
  const id = targetNode.id();
  const targetMainNode = mainNodeMap.value[id]; // 響應式 Node
  if (!targetMainNode) return;
  const { x, y, width, height, opacity, rotation } = targetMainNode;
  const tweenVars = {
    x: x + adModuleX.value,
    y: y + adModuleY.value,
    width,
    height,
    opacity,
    rotation,
    ease: 'none'
  };
  const tween = addTween2(targetNode, duration, start, tweenVars, tweenVars);
  return tween;
};

// test
const addTween2 = (
  targetNode: Node,
  duration: number,
  start: number,
  fromVars: TweenVars,
  toVars: TweenVars
) => {
  if (!gsapTimeline || !targetNode) return null;
  const newX = targetNode.x() + gsap.utils.random(-800, 800, 5);
  const newY = targetNode.y() + gsap.utils.random(-800, 800, 5);
  const newRotation = gsap.utils.random(-1800, 1800, 5);
  const newOpacity = gsap.utils.random(0.5, 1, 0.1);
  const tween = gsap.fromTo(
    targetNode,
    { ...fromVars },
    {
      duration,
      ...toVars,
      x: newX,
      y: newY,
      rotation: newRotation,
      opacity: newOpacity
    }
  );
  gsapTimeline?.add(tween, start);
  return tween;
};
```
