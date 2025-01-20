# Animation Editor

## Development Environment

- Node v20.10.0
- Nuxt v3.14
- Konva v9.3.16

## Features

- 鍵盤：刪除、方向鍵移動。
- 游標：拖曳、群組選取、cmd + 滾輪放大縮小。
- 動畫時間軸：使用 Gsap.timeline。

## TODO List

- 模板：換圖。
- 鍵盤：複製。
- 通用：undo、snap、輸入值。
- 動畫設定：設定初始狀態、和結束狀態。
- 時間軸：鍵盤操作、物件可多選操作。

## Reference

- [GSAP Timeline](https://gsap.com/docs/v3/GSAP/Timeline/)
- [Konva](https://konvajs.org/api/Konva.html)
- [Nuxt UI](https://ui.nuxt.com/)

## 問題點

- 循環引用：composable 的用法有問題，功能間過度耦合，相同的 useXxx 被不斷地重複呼叫。

## 設計原則

1. 單向依賴：確保 Composable A 和 Composable B 之間的依賴是單向的，避免循環引用。
2. 集中狀態管理：使用 useState 來管理共享的狀態。
3. 關注點分離 (Separation of Concerns)：將可重用的邏輯封裝到 composables，並僅暴露必要的函數與狀態。
