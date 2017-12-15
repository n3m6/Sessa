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
  /*
  Simple trend following system based on two moving averages.
  Go long when fast ma is above slow ma.
  Go short when fast ma is below slow ma.
  */
  DOUBLEMA: 'doubleMA',
  DOUBLEMALONG: 'doubleMALong', // same as above but only takes longs
  DOUBLEMASHORT: 'doubleMAShort', // same as above but only takes shorts
};

// CHANGE THIS VALUE TO CHANGE STRAT
const defaultstrat = StratEnum.DOUBLEMA;

const strats = [];
strats.threeGreen = [];
strats.threeGreen.enter = function threeGreenEnter(args) {
  const {
    close, sma1, macd, rsi,
  } = args;
  const rsiHigh = 60;
  const rsiLow = 40;

  if (sma1 > close && macd < 0 && rsi < rsiLow) {
    return [true, 'SHORT'];
  }
  if (sma1 < close && macd > 0 && rsi > rsiHigh) {
    return [true, 'LONG'];
  }
  return [false, ''];
};

strats.threeGreen.exit = function threeGreenExit(args) {
  const { close, sma1, orderType } = args;
  if (orderType === 'LONG') {
    if (close < sma1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (close > sma1) return true;

    return false;
  }
  return false;
};

strats.simpleCrossOver = [];
strats.simpleCrossOver.enter = function simpleCrossOverEnter(args) {
  const { open, close, sma1 } = args;

  // console.log(`open: ${open} close: ${close} sma20: ${sma20}`);
  if (open > sma1 && close < sma1) return [true, 'SHORT'];
  if (open < sma1 && close > sma1) return [true, 'LONG'];

  return [false, ''];
};

strats.simpleCrossOver.exit = function simpleCrossOverExit(args) {
  const {
    open, close, sma1, orderType,
  } = args;
  if (orderType === 'LONG') {
    if (open > sma1 && close < sma1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (open < sma1 && close > sma1) return true;
    return false;
  }
  return false;
};

strats.doubleMA = [];

strats.doubleMA.enter = function doubleMAEnter(args) {
  const { sma1, sma2 } = args;

  if (sma1 > sma2) return [true, 'LONG'];
  if (sma2 > sma1) return [true, 'SHORT'];
  return [false, ''];
};

strats.doubleMA.exit = function doubleMAExit(args) {
  const { sma1, sma2, orderType } = args;

  if (orderType === 'LONG') {
    if (sma2 > sma1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (sma1 > sma2) return true;
    return false;
  }
  return false;
};

// long only
strats.doubleMALong = [];

strats.doubleMALong.enter = function doubleMALongEnter(args) {
  const { sma1, sma2 } = args;

  if (sma1 > sma2) return [true, 'LONG'];
  // if (sma2 > sma1) return [true, 'SHORT'];
  return [false, ''];
};

strats.doubleMALong.exit = function doubleMALongExit(args) {
  const { sma1, sma2, orderType } = args;

  if (orderType === 'LONG') {
    if (sma2 > sma1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (sma1 > sma2) return true;
    return false;
  }
  return false;
};

// short only
strats.doubleMAShort = [];

strats.doubleMAShort.enter = function doubleMAShortEnter(args) {
  const { sma1, sma2 } = args;

  // if (sma1 > sma2) return [true, 'LONG'];
  if (sma2 > sma1) return [true, 'SHORT'];
  return [false, ''];
};

strats.doubleMAShort.exit = function doubleMAShortExit(args) {
  const { sma1, sma2, orderType } = args;

  if (orderType === 'LONG') {
    if (sma2 > sma1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (sma1 > sma2) return true;
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
