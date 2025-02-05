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
