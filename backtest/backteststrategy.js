const BacktestStrategy = function BacktestStrategy() {};

BacktestStrategy.prototype.simpleCrossOverEnter = function simpleCrossOverEnter(open, close, sma) {
  if (open > sma && close < sma) return [true, 'SHORT'];
  if (open < sma && close > sma) return [true, 'LONG'];
  return [false, ''];
};

BacktestStrategy.prototype.simpleCrossOverExit = function simpleCrossOverExit(
  open,
  close,
  sma,
  orderType,
) {
  if (orderType === 'LONG') {
    if (open > sma && close < sma) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (open < sma && close > sma) return true;
    return false;
  }
  return false;
};

exports.BacktestStrategy = new BacktestStrategy();
