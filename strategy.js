const Strategy = function Strategy() {};

const StratEnum = {
  /*
  Three Green Arrows strategy is a simple entry/exit strategy
  used in scalping and similar fast trading systems
  it enters a trade when RSI, MACD and moving average cross overs
  occur, when all three are favourable.
  */
  THREEGREEN: 'threeGreen',
  /*
  Simple cross over simple enters/exits a trade when a candle passes
  over the moving average boundary.
  Often used in trend following systems
  */
  SIMPLECROSSOVER: 'simpleCrossOver',
};

// CHANGE THIS VALUE TO CHANGE STRAT
const defaultstrat = StratEnum.SIMPLECROSSOVER;

const strats = [];
strats.threeGreen = [];
strats.threeGreen.enter = function threeGreenEnter(args) {
  const {
    close, sma20, macd, rsi,
  } = args;
  const rsiHigh = 60;
  const rsiLow = 40;

  if (sma20 > close && macd < 0 && rsi < rsiLow) {
    return [true, 'SHORT'];
  }
  if (sma20 < close && macd > 0 && rsi > rsiHigh) {
    return [true, 'LONG'];
  }
  return [false, ''];
};

strats.threeGreen.exit = function threeGreenExit(args) {
  const { close, sma20, orderType } = args;
  if (orderType === 'LONG') {
    if (close < sma20) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (close > sma20) return true;

    return false;
  }
  return false;
};

strats.simpleCrossOver = [];
strats.simpleCrossOver.enter = function simpleCrossOverEnter(args) {
  const { open, close, sma20 } = args;
  if (open > sma20 && close < sma20) return [true, 'SHORT'];
  if (open < sma20 && close > sma20) return [true, 'LONG'];
  return [false, ''];
};

strats.simpleCrossOver.exit = function simpleCrossOverExit(args) {
  const {
    open, close, sma20, orderType,
  } = args;
  if (orderType === 'LONG') {
    if (open > sma20 && close < sma20) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (open < sma20 && close > sma20) return true;
    return false;
  }
  return false;
};

Strategy.prototype.enter = function enter(args) {
  return strats[defaultstrat].enter(args);
};

Strategy.prototype.exit = function threeGreenExit(args) {
  return strats[defaultstrat].exit(args);
};

exports.Strategy = new Strategy();
