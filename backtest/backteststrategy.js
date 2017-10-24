const BacktestStrategy = function BacktestStrategy() {};

BacktestStrategy.prototype.simpleCrossOverEnter = function simpleCrossOverEnter(curr) {
  const { open, close, ma1 } = curr;
  if (open > ma1 && close < ma1) return [true, 'SHORT'];
  if (open < ma1 && close > ma1) return [true, 'LONG'];
  return [false, ''];
};

BacktestStrategy.prototype.simpleCrossOverExit = function simpleCrossOverExit(curr, orderType) {
  const { open, close, ma1 } = curr;
  if (orderType === 'LONG') {
    if (open > ma1 && close < ma1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (open < ma1 && close > ma1) return true;
    return false;
  }
  return false;
};

BacktestStrategy.prototype.doubleMAEnter = function doubleMAEnter(curr) {
  const { ma1, ma2 } = curr;
  if (ma1 > ma2) return [true, 'LONG'];
  if (ma2 > ma1) return [true, 'SHORT'];
  return [false, ''];
};

BacktestStrategy.prototype.doubleMAExit = function doubleMAExit(curr, orderType) {
  const { ma1, ma2 } = curr;

  if (orderType === 'LONG') {
    if (ma2 > ma1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (ma1 > ma2) return true;
    return false;
  }
  return false;
};

BacktestStrategy.prototype.doubleMAFingertapEnter = function doubleMAFingertapEnter(curr) {
  const { close, ma1, ma2 } = curr;
  if (ma1 > ma2 && close > ma1) return [true, 'LONG'];
  if (ma2 > ma1 && close < ma1) return [true, 'SHORT'];
  return [false, ''];
};

BacktestStrategy.prototype.doubleMAFingertapExit = function doubleMAFingertapExit(curr, orderType) {
  const { close, ma1, ma2 } = curr;

  if (orderType === 'LONG') {
    if (ma2 > ma1) return true;
    if (ma1 > ma2 && close < ma1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (ma1 > ma2) return true;
    if (ma2 > ma1 && close > ma1) return true;
    return false;
  }

  return false;
};

BacktestStrategy.prototype.doubleEMAEnter = function doubleEMAEnter(curr) {
  const { ema1, ema2 } = curr;
  if (ema1 > ema2) return [true, 'LONG'];
  if (ema2 > ema1) return [true, 'SHORT'];
  return [false, ''];
};

BacktestStrategy.prototype.doubleEMAExit = function doubleEMAExit(curr, orderType) {
  const { ema1, ema2 } = curr;

  if (orderType === 'LONG') {
    if (ema2 > ema1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (ema1 > ema2) return true;
    return false;
  }
  return false;
};

BacktestStrategy.prototype.doubleEMAFingertapEnter = function doubleEMAFingertapEnter(curr) {
  const { close, ema1, ema2 } = curr;
  if (ema1 > ema2 && close > ema1) return [true, 'LONG'];
  if (ema2 > ema1 && close < ema1) return [true, 'SHORT'];
  return [false, ''];
};

BacktestStrategy.prototype.doubleEMAFingertapExit = function doubleEMAFingertapExit(
  curr,
  orderType,
) {
  const { close, ema1, ema2 } = curr;

  if (orderType === 'LONG') {
    if (ema2 > ema1) return true;
    if (ema1 > ema2 && close < ema1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (ema1 > ema2) return true;
    if (ema2 > ema1 && close > ema1) return true;
    return false;
  }

  return false;
};

BacktestStrategy.prototype.donchianEnter = function donchianEnter(curr) {
  const {
    high, low, dc1high, dc1low,
  } = curr;
  if (high >= dc1high) return [true, 'LONG'];
  if (low <= dc1low) return [true, 'SHORT'];
  return [false, ''];
};

BacktestStrategy.prototype.donchianExit = function donchianExit(curr, orderType) {
  const {
    high, low, dc1high, dc1low,
  } = curr;
  if (orderType === 'LONG') {
    if (low <= dc1low) return true;
    return false;
  }

  if (orderType === 'SHORT') {
    if (high >= dc1high) return true;
    return false;
  }
  return false;
};

BacktestStrategy.prototype.donchianMidEnter = function donchianMidEnter(curr) {
  const {
    high, low, dc1high, dc1low,
  } = curr;
  if (high >= dc1high) return [true, 'LONG'];
  if (low <= dc1low) return [true, 'SHORT'];
  return [false, ''];
};

BacktestStrategy.prototype.donchianMidExit = function donchianMidExit(curr, orderType) {
  const {
    high, low, close, dc1high, dc1mid, dc1low,
  } = curr;
  if (orderType === 'LONG') {
    if (close < dc1mid) return true;
    if (low <= dc1low) return true;
    return false;
  }

  if (orderType === 'SHORT') {
    if (close > dc1mid) return true;
    if (high >= dc1high) return true;
    return false;
  }
  return false;
};

BacktestStrategy.prototype.doubleDonchianEnter = function doubleDonchianEnter(curr) {
  const {
    high, low, dc2high, dc2low,
  } = curr;
  if (high >= dc2high) return [true, 'LONG'];
  if (low <= dc2low) return [true, 'SHORT'];
  return [false, ''];
};

BacktestStrategy.prototype.doubleDonchianExit = function doubleDonchianExit(curr, orderType) {
  const {
    high, low, dc1high, dc1low,
  } = curr;
  if (orderType === 'LONG') {
    if (low <= dc1low) return true;
    return false;
  }

  if (orderType === 'SHORT') {
    if (high >= dc1high) return true;
    return false;
  }
  return false;
};

exports.BacktestStrategy = new BacktestStrategy();
