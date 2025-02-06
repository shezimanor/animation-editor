import Konva from 'konva';

interface SnapData {
  lineGuide: number;
  offset: number;
  diff: number;
  snap: string;
}
interface ItemSnappingEdgeData {
  guide: number;
  offset: number;
  snap: string;
}

interface GuideData {
  lineGuide: number;
  offset: number;
  orientation: string;
  snap: string;
}

export const magicFormula = (value: number, decimal: number = 1000) => {
  return Math.round(value * decimal) / decimal;
};

export const getTimeByNodeX = (x: number) => {
  // bar 是放在軌道群組裡面，所以起始點就是軌道的起始點，所以 x 不需要減去 TIMELINE_TRACK_START_X, 但是軌道總長度就需要減
  const trackWidth = window.innerWidth - TIMELINE_TRACK_WIDTH_SUBTRACTION - TIMELINE_TRACK_START_X;
  let time = magicFormula((x / trackWidth) * TOTAL_DURATION, 1000);
  // console.log('getTimeByNodeX: ', time);
  return time < 0 ? 0 : time;
};

export const getNodeXByTime = (time: number) => {
  const trackWidth = window.innerWidth - TIMELINE_TRACK_WIDTH_SUBTRACTION - TIMELINE_TRACK_START_X;
  let x = magicFormula((time / TOTAL_DURATION) * trackWidth, 1);
  // console.log('getNodeXByTime: ', x);
  return x < 0 ? 0 : x;
};

export const getDurationByBarWidth = (width: number) => {
  // bar 是放在軌道群組裡面，所以起始點就是軌道的起始點，所以 x 不需要減去 TIMELINE_TRACK_START_X, 但是軌道總長度就需要減
  const trackWidth = window.innerWidth - TIMELINE_TRACK_WIDTH_SUBTRACTION - TIMELINE_TRACK_START_X;
  let duration = magicFormula((width / trackWidth) * TOTAL_DURATION, 1000);
  // console.log('getDurationByBarWidth: ', duration);
  return duration < 0 ? 0 : duration;
};

export const getLineGuideStops = (
  skipImages: Konva.Image[],
  adModule: Konva.Rect,
  layer: Konva.Layer
) => {
  // we can snap to stage borders and the center of the stage
  // 去掉中心點
  // const vertical = [0, layer.width() / 2, layer.width()];
  // const horizontal = [0, layer.height() / 2, layer.height()];
  const vertical = [0, layer.width() / 2, layer.width()];
  const horizontal = [0, layer.height() / 2, layer.height()];

  // 廣告模組的對齊線
  const adModuleBox = adModule.getClientRect();
  vertical.push(adModuleBox.x, adModuleBox.x + adModuleBox.width);
  horizontal.push(adModuleBox.y, adModuleBox.y + adModuleBox.height);

  // 找出對齊圖片的對齊線
  layer.find('.item').forEach((guideItem) => {
    if (skipImages.find((img) => img._id === guideItem._id)) {
      return;
    }
    const box = guideItem.getClientRect();
    // and we can snap to all edges of shapes
    vertical.push(box.x, box.x + box.width, box.x + box.width / 2);
    horizontal.push(box.y, box.y + box.height, box.y + box.height / 2);
  });

  return {
    vertical: [...new Set(vertical)],
    horizontal: [...new Set(horizontal)]
  };
};

export const getItemSnappingEdges = (imgItem: Konva.Image) => {
  const box = imgItem.getClientRect();
  const absPos = imgItem.absolutePosition();

  return {
    vertical: [
      {
        guide: Math.round(box.x),
        offset: Math.round(absPos.x - box.x),
        snap: 'start'
      },
      {
        guide: Math.round(box.x + box.width / 2),
        offset: Math.round(absPos.x - box.x - box.width / 2),
        snap: 'center'
      },
      {
        guide: Math.round(box.x + box.width),
        offset: Math.round(absPos.x - box.x - box.width),
        snap: 'end'
      }
    ],
    horizontal: [
      {
        guide: Math.round(box.y),
        offset: Math.round(absPos.y - box.y),
        snap: 'start'
      },
      {
        guide: Math.round(box.y + box.height / 2),
        offset: Math.round(absPos.y - box.y - box.height / 2),
        snap: 'center'
      },
      {
        guide: Math.round(box.y + box.height),
        offset: Math.round(absPos.y - box.y - box.height),
        snap: 'end'
      }
    ]
  };
};

export const getGuides = (
  lineGuideStops: {
    vertical: number[];
    horizontal: number[];
  },
  itemBounds: {
    vertical: {
      guide: number;
      offset: number;
      snap: string;
    }[];
    horizontal: {
      guide: number;
      offset: number;
      snap: string;
    }[];
  }
) => {
  const resultV: SnapData[] = [];
  const resultH: SnapData[] = [];

  lineGuideStops.vertical.forEach((lineGuide: number) => {
    itemBounds.vertical.forEach((itemBound: ItemSnappingEdgeData) => {
      var diff = Math.abs(lineGuide - itemBound.guide);
      // if the distance between guild line and object snap point is close we can consider this for snapping
      if (diff < GUIDELINE_OFFSET) {
        resultV.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset
        });
      }
    });
  });

  lineGuideStops.horizontal.forEach((lineGuide: number) => {
    itemBounds.horizontal.forEach((itemBound: ItemSnappingEdgeData) => {
      var diff = Math.abs(lineGuide - itemBound.guide);
      if (diff < GUIDELINE_OFFSET) {
        resultH.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset
        });
      }
    });
  });

  var guides = [];

  // find closest snap
  const minV = resultV.sort((a, b) => a.diff - b.diff)[0];
  const minH = resultH.sort((a, b) => a.diff - b.diff)[0];
  if (minV) {
    guides.push({
      lineGuide: minV.lineGuide,
      offset: minV.offset,
      orientation: 'V',
      snap: minV.snap
    });
  }
  if (minH) {
    guides.push({
      lineGuide: minH.lineGuide,
      offset: minH.offset,
      orientation: 'H',
      snap: minH.snap
    });
  }
  return guides;
};

export const drawGuides = (guides: GuideData[], layer: Konva.Layer) => {
  console.log(guides.length);
  guides.forEach((lg) => {
    if (lg.orientation === 'H') {
      console.log('h');
      const line = new Konva.Line({
        points: [-6000, 0, 6000, 0],
        stroke: GUIDELINE_COLOR,
        strokeWidth: 1,
        name: 'guide-line',
        dash: [4, 6]
      });
      layer.add(line);
      line.absolutePosition({
        x: 0,
        y: lg.lineGuide
      });
    } else if (lg.orientation === 'V') {
      console.log('v');
      const line = new Konva.Line({
        points: [0, -6000, 0, 6000],
        stroke: GUIDELINE_COLOR,
        strokeWidth: 1,
        name: 'guide-line',
        dash: [4, 6]
      });
      layer.add(line);
      line.absolutePosition({
        x: lg.lineGuide,
        y: 0
      });
    }
  });
};
