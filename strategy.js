const Strategy = function Strategy() {};

// Three Green Arrows strategy is a simple entry/exit strategy
// particularly useful for 5 minute scalping.
Strategy.prototype.threeGreenEnter = function threeGreenEnter(close, sma, macd, rsi) {
  const rsiHigh = 60;
  const rsiLow = 40;

  if (sma > close && macd < 0 && rsi < rsiLow) {
    return [true, 'SHORT'];
  }
  if (sma < close && macd > 0 && rsi > rsiHigh) {
    return [true, 'LONG'];
  }
  return [false, ''];
};

Strategy.prototype.threeGreenExit = function threeGreenExit(close, sma, position) {
  if (position.orderType === 'LONG') {
    if (close < sma) return true;
    return false;
  }
  if (position.orderType === 'SHORT') {
    if (close > sma) return true;

    return false;
  }
  return false;
};

exports.Strategy = new Strategy();
