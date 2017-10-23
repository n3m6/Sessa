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

BacktestStrategy.prototype.doubleEMAEnter = function doubleEMAEnter() {
  return [false, ''];
};
BacktestStrategy.prototype.doubleEMAExit = function doubleEMAExit() {
  return [false, ''];
};

exports.BacktestStrategy = new BacktestStrategy();
