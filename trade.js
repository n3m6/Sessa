const utils = require('./utils.js');

const Trade = function Trade() {};

// Three Green Arrows strategy is a simple entry/exit strategy
// particularly useful for 5 minute scalping.
Trade.prototype.threeGreenEnter = function threeGreenEnter(close, sma, macd, rsi) {
  const rsiHigh = 60;
  const rsiLow = 40;

  if (sma > close && macd < 0 && rsi < rsiLow) return true;
  if (sma < close && macd > 0 && rsi > rsiHigh) return true;
  return false;
};

Trade.prototype.threeGreenExit = function threeGreenExit(close, sma, position) {
  return false;
};

exports.Trade = new Trade();
