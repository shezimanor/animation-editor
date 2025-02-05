export const GUIDELINE_OFFSET = 5; // 對齊線偏移量
export const GUIDELINE_COLOR = '#38bdf8'; // Snapping 對齊線顏色
export const TOTAL_DURATION = 6; // 預設總時長(秒)
export const ASIDE_WIDTH = 0; // 左側欄寬度(目前沒有左側欄)
export const HEADER_HEIGHT = 56; // 頁首高度
export const FOOTER_HEIGHT = 214; // 頁尾高度
export const TIMELINE_TICK_SPACE = 7; // 時間軸指針頭的半徑預留空間
export const TIMELINE_TRACK_HEIGHT = 24; // 時間軸軌道高度(也是縮圖的寬度)
export const TIMELINE_THUMBNAIL_MARGIN_RIGHT = 8; // 時間軸縮圖右邊距
export const TIMELINE_THUMBNAIL_PLACEHOLDER =
  TIMELINE_TRACK_HEIGHT + TIMELINE_THUMBNAIL_MARGIN_RIGHT; // 時間軸縮圖的總佔位
export const TIMELINE_CONTAINER_PADDING_LEFT = 16; // 時間軸容器左內邊距
export const TIMELINE_CONTAINER_PADDING_RIGHT = 16 + TIMELINE_THUMBNAIL_PLACEHOLDER; // 時間軸容器右內邊距
export const TIMELINE_TRACK_WIDTH_SUBTRACTION =
  ASIDE_WIDTH +
  TIMELINE_CONTAINER_PADDING_LEFT +
  TIMELINE_CONTAINER_PADDING_RIGHT +
  TIMELINE_TICK_SPACE;
export const TIMELINE_TRACK_START_X = TIMELINE_THUMBNAIL_PLACEHOLDER + TIMELINE_TICK_SPACE; // 時間軸軌道起始 x 座標
export const TIMELINE_NODE_COLOR = '#38bdf8'; // 時間軸動畫條(與節點)顏色
export const TIMELINE_NODE_ACTIVE_COLOR = '#60a5fa'; // 時間軸動畫條(與節點) active 顏色
export const TIMELINE_TRACK_GAP_Y = 4; // 時間軸軌道上下間距
export const TIMELINE_CONTAINER_HEIGHT = FOOTER_HEIGHT - 34; // 時間軸容器高度
export const AD_MODULE_COOKIE_CONFIG = {
  default: () => ({
    width: 640,
    height: 320,
    mmid: 'test-mmid',
    cmid: 'test-cmid',
    token: 'test-token',
    title: '標題'
  })
};
