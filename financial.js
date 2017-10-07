/* const utils = require('./utils.js');

const Financial = function Financial() {
  this.prev12ema = 0;
  this.prev26ema = 0;
  this.prevSignal = 0;
  this.prevRSI = 0;
  this.prevRSIAverageGain = 0;
  this.prevRSIAverageLoss = 0;
  this.prevTR = 0;
  this.prevATR = 0;
  this.prevEMA = 0;
};

Financial.prototype.sma = function sma(data, range) {
  const as = utils.arraySlice(range, data);
  const total = as.reduce((sum, value) => sum + value.close, 0);

  return total / as.length;
};

Financial.prototype.ema = function ema(data, range) {
  if (data.length === 1) {
    this.prevEMA = data[data.length - 1].close;
    return this.prevEMA;
  }
  const coefficient = 2 / (range + 1);
  const close = data[data.length - 1].close; // eslint-disable-line
  const tmp = (close - this.prevEMA) * coefficient;

  this.prevEMA = tmp + this.prevEMA;
  return this.prevEMA;
};

// Relative Strength Index for measuring momentum of trend
Financial.prototype.rsi = function rsi(data, range) {
  if (data.length < range) return 1; // ignore first part

  if (data.length === range) {
    const candles = utils.arraySlice(range, data);
    const gains = candles.filter(elem => elem.close > elem.open);
    let totalGains = 0;
    for (let i = 0; i < gains.length; i += 1) {
      totalGains += gains[i].close - gains[i].open;
    }
    const losses = candles.filter(elem => elem.open > elem.close);
    let totalLosses = 0;
    for (let i = 0; i < losses.length; i += 1) {
      totalLosses += losses[i].open - losses[i].close;
    }
    this.prevRSIAverageGain = totalGains / range;
    this.prevRSIAverageGain = this.prevRSIAverageGain === 0 ? 0.01 : this.prevRSIAverageGain;
    this.prevRSIAverageLoss = totalLosses / range;
    this.prevRSIAverageLoss = this.prevRSIAverageLoss === 0 ? 0.01 : this.prevRSIAverageLoss;

    const RS = this.prevRSIAverageGain / this.prevRSIAverageLoss;
    const iRS = 100 / (1 + RS);

    this.prevRSI = 100 - iRS;

    return this.prevRSI;
  }

  const currentCandle = data[data.length - 1];

  let currentGain = currentCandle.close - currentCandle.open;
  currentGain = currentGain < 0 ? 0 : currentGain;

  let currentLoss = currentCandle.open - currentCandle.close;
  currentLoss = currentLoss < 0 ? 0 : currentLoss;

  const prevGains = this.prevRSIAverageGain * (range - 1);
  this.prevRSIAverageGain = (prevGains + currentGain) / range;
  const prevLosses = this.prevRSIAverageLoss * (range - 1);
  this.prevRSIAverageLoss = (prevLosses + currentLoss) / range;

  const RS = this.prevRSIAverageGain / this.prevRSIAverageLoss;
  const iRS = 100 / (1 + RS);

  this.prevRSI = 100 - iRS;

  return this.prevRSI;
};

function macdEMA(previousEMA, currentClose, range) {
  const r = 2 / (range + 1);
  const curr = currentClose * r;
  const prev = previousEMA * (1 - r);
  return curr + prev;
}

// MACD Moving average convergence divergence - for finding entry point
Financial.prototype.macd = function macd(data, range1, range2, signalRange) {
  if (data.length === 1) {
    const d = data[0].close;
    this.prev12ema = d;
    this.prev26ema = d;
    this.prevSignal = 0;
    return 1;
  }

  const range1EMA = macdEMA(this.prev12ema, data[data.length - 1].close, range1);
  const range2EMA = macdEMA(this.prev26ema, data[data.length - 1].close, range2);
  const macdLine = range1EMA - range2EMA;
  const signal = macdEMA(this.prevSignal, macdLine, signalRange);
  this.prev12ema = range1EMA;
  this.prev26ema = range2EMA;
  this.prevSignal = signal;

  return macdLine - signal;
};

function trueRange(curr, prev) {
  const highLow = Math.abs(curr.high - curr.low);
  const highPrevClose = Math.abs(curr.high - prev.close);
  const LowPrevClose = Math.abs(curr.low - prev.close);
  return Math.max(highLow, highPrevClose, LowPrevClose);
}

Financial.prototype.atr = function atr(data, range) {
  if (data.length < range) {
    const currentCandle = data[data.length - 1];
    const tr = Math.abs(currentCandle.high - currentCandle.low);
    const avgtr = tr;
    this.prevTR = tr;
    this.prevATR = avgtr;
    return [tr, avgtr];
  }
  if (data.length === range) {
    const currentCandle = data[data.length - 1];
    const prevCandle = data[data.length - 2];
    const tr = trueRange(currentCandle, prevCandle);
    this.prevTR = tr;

    const trMap = [];
    for (let i = 0; i < data.length; i += 1) {
      if (i === 0) {
        const curr = data[i];
        trMap.push(Math.abs(curr.high - curr.low));
      } else {
        const curr = data[i];
        const prev = data[i - 1];
        trMap.push(trueRange(curr, prev));
      }
    }
    // console.log(JSON.stringify(trMap));
    const totalTR = trMap.reduce((sum, val) => sum + val, 0);
    const avgtr = totalTR / range;
    this.prevATR = avgtr;
    return [tr, avgtr];
  }

  const curr = data[data.length - 1];
  const prev = data[data.length - 2];
  const tr = trueRange(curr, prev);
  const tmp = this.prevATR * (range - 1);
  const avgtr = (tmp + tr) / range;

  this.prevTR = tr;
  this.prevATR = avgtr;

  return [tr, avgtr];
};

// Choppiness Indicator -- to avoid trading in ranges
// Choppiness indicator is incomplete
// Financial.prototype.chop = function chop(data, range) {
//  const [tr, atr] = this.atr(data, range);
//  return atr;
// };

exports.Financial = new Financial();
*/

// test code
/* const fin = new Financial();
const prices = [];
for (let i = 0; i < 29; i += 1) {
  const open = fin.roundTo(randomizer(10, 30), 2);
  const high = fin.roundTo(randomizer(open + 1, open + 7), 2);
  const close = fin.roundTo(randomizer(10, 30), 2);
  const low = fin.roundTo(randomizer(close - 7, close - 1), 2);
  prices.push({
    open,
    high,
    low,
    close,
  });
}

// Header
console.log('Open\tClose\tHigh\tLow\tATR');

for (let i = 0; i < prices.length; i += 1) {
  let arr = [];
  if (prices.length === 1) {
    [arr] = prices;
  } else {
    arr = prices.slice(0, i + 1);
  }
  const currCandle = prices[i];
  const chops = fin.chop(arr, 14);
  console.log(`${currCandle.open}\t${currCandle.close}`);
} */
