const Trade = function Trade() {};

// Three Green Arrows strategy is a simple entry/exit strategy
// particularly useful for 5 minute scalping.
Trade.prototype.threeGreenEnter = function threeGreenEnter(close, sma, macd, rsi) {
  return 1;
};

Trade.prototype.threeGreenExit = function threeGreenExit(close, sma, position) {
  return 1;
};

exports.Trade = new Trade();
