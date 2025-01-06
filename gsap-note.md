# GSAP Timeline 筆記

```javascript
gsapTimeline.to(targetNode, { x: targetNode.x() + 50, duration: 1 }, 0);
gsapTimeline.to(
  targetNode,
  {
    x: targetNode.x() + 50,
    y: targetNode.y() + 50,
    duration: 1
  },
  1
);
gsapTimeline.to(
  targetNode,
  {
    rotation: targetNode.rotation() + 360,
    duration: 2
  },
  2
);
gsapTimeline.to(
  targetNode,
  {
    scaleX: 3,
    scaleY: 3,
    opacity: 0,
    duration: 2
  },
  4
);
```
