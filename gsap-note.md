# GSAP Timeline 筆記

Eases: [docs](https://gsap.com/docs/v3/Eases)

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
    duration: 2,
    ease: 'power1.inOut'
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

```
// 漸變動畫
var tween = gsap.to(element, { duration: 1, x: 100, opacity: 0.5 });
tl.add(tween);

// 指定位置
var setValues = gsap.set(element, { x: 100, opacity: 0.5 });
tl.add(setValues);

// 頭尾設定
var tween = gsap.fromTo(element, { x: -100 }, { duration: 1, x: 100 });
tl.add(tween);
```
