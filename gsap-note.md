# GSAP Timeline 筆記

Eases: [docs](https://gsap.com/docs/v3/Eases)

## 其他注意事項

tween 物件加入 timeline 後，一旦開始播放過 timeline 後，任何手動的修改 tween 物件，都不會影響 timeline 的動畫，在 timeline 播放前的修改才有作用。

當整個 timeline 有設定 duration (t) 時，如果加入的 tween 總時數不滿指定的 duration，會改變 timescale，可以用 timeline.set (node, varsObj, t) 來解決。

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

```javascript
// 漸變動畫
var tween = gsap.to(element, { duration: 1, x: 100, opacity: 0.5 });
tl.add(tween);

// 指定位置
var setValues = gsap.set(element, { x: 100, opacity: 0.5 });
tl.add(setValues);

// 頭尾設定
var tween = gsap.fromTo(element, { x: -100 }, { duration: 1, x: 100, immediateRender: true });
tl.add(tween);
```
