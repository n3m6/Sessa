const utils = require('../utils');
const config = require('../config');

const DeltaFinancial = function DeltaFinancial() {};

DeltaFinancial.prototype.sma = function sma(data, range, currClose) {
  if (data[0] != null) {
    const as = utils.arraySlice(range - 1, data);
    let total = as.reduce((sum, value) => sum + parseFloat(value.close), 0);
    total += parseFloat(currClose);
    const divider = as.length + 1;
    return utils.roundTo(total / divider, config.indicatorSignificant);
  }
  return currClose;
};

DeltaFinancial.prototype.rsi = function rsi(data, range, current) {
  if (data.length + 1 < range) return [1, 1, 1]; // ignore first part

  if (data.length + 1 === range) {
    const tmp = data.slice(); // lmao copy array not create another reference
    tmp.push(current);
    const candles = utils.arraySlice(range, tmp);

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
    let avggain = totalGains / range;
    avggain = avggain === 0 ? 0.01 : avggain; // prevent divide by zero
    let avgloss = totalLosses / range;
    avgloss = avgloss === 0 ? 0.01 : avgloss;

    const RS = avggain / avgloss;
    const iRS = 100 / (1 + RS);

    let rsitmp = 100 - iRS;

    avggain = utils.roundTo(avggain, 8);
    avgloss = utils.roundTo(avgloss, 8);
    rsitmp = utils.roundTo(rsitmp, config.indicatorSignificant);

    return [avggain, avgloss, rsitmp];
  }

  const currentCandle = current;
  const lastCandle = data[data.length - 1];

  let currentGain = currentCandle.close - currentCandle.open;
  currentGain = currentGain < 0 ? 0 : currentGain;

  let currentLoss = currentCandle.open - currentCandle.close;
  currentLoss = currentLoss < 0 ? 0 : currentLoss;

  const prevGain = lastCandle.rsiavggain * (range - 1);
  let avggain = (prevGain + currentGain) / range;
  const prevLoss = lastCandle.rsiavgloss * (range - 1);
  let avgloss = (prevLoss + currentLoss) / range;
  // console.log(`avggain: ${avggain}\t avgloss: ${avgloss}`);

  avggain = avggain === 0 ? 0.01 : avggain; // prevent divide by zero
  avgloss = avgloss === 0 ? 0.01 : avgloss;

  const RS = avggain / avgloss;
  const iRS = 100 / (1 + RS);

  let rsitmp = 100 - iRS;
  avggain = utils.roundTo(avggain, 8);
  avgloss = utils.roundTo(avgloss, 8);
  rsitmp = utils.roundTo(rsitmp, config.indicatorSignificant);

  return [avggain, avgloss, rsitmp];
};

function macdEMA(previousEMA, currentClose, range) {
  const r = 2 / (range + 1);
  const curr = currentClose * r;
  const prev = previousEMA * (1 - r);
  return curr + prev;
}

// MACD Moving average convergence divergence - for finding entry point
DeltaFinancial.prototype.macd = function macd(data, range1, range2, signalRange, current) {
  if (data[0] === null) {
    const d = current.close;
    const ema12 = utils.roundTo(d, config.indicatorSignificant);
    const ema26 = utils.roundTo(d, config.indicatorSignificant);
    const signal = 0;
    const tmacd = 0.01;
    return [ema12, ema26, signal, tmacd];
  }

  const pre12ema = data[data.length - 1].mema12;
  const pre26ema = data[data.length - 1].mema26;
  const presignal = data[data.length - 1].msignal;
  const d = current.close;

  const range1EMA = macdEMA(pre12ema, d, range1);
  const range2EMA = macdEMA(pre26ema, d, range2);
  const macdLine = range1EMA - range2EMA;

  const ema12 = utils.roundTo(range1EMA, config.indicatorSignificant);
  const ema26 = utils.roundTo(range2EMA, config.indicatorSignificant);
  const signal = utils.roundTo(macdEMA(presignal, macdLine, signalRange), 4);
  const tmacd = utils.roundTo(macdLine - signal, 4);

  return [ema12, ema26, signal, tmacd];
};

function trueRange(current, last) {
  const tmp = Math.max(
    Math.abs(current.high - current.low),
    Math.abs(current.high - last.close),
    Math.abs(last.close - current.low),
  );
  return tmp;
}

DeltaFinancial.prototype.avgTrueRange = function avgTrueRange(data, range, current) {
  if (data.length + 1 < 3) {
    return [1, 1];
  }
  if (data.length + 1 < range + 1) {
    const last = data[data.length - 1];
    const tr = trueRange(current, last);
    return [tr, 1];
  }
  if (data.length + 1 === range + 1) {
    const last = data[data.length - 1];
    const tr = trueRange(current, last);

    const tmpCurr = Object.assign({}, current);
    tmpCurr.tr = tr;
    const tmpData = data.slice(1); // skip 1
    tmpData.push(tmpCurr);

    const total = tmpData.reduce((sum, value) => sum + parseFloat(value.tr), 0);
    const avgtr = total / range;
    return [tr, avgtr];
  }

  const last = data[data.length - 1];
  const tr = trueRange(current, last);

  const n1 = (range - 1) * parseFloat(last.atr);
  const total = n1 + tr;
  const atr = total / range;
  return [tr, atr];
};

exports.DeltaFinancial = new DeltaFinancial();

// KEEP THIS FOR TESTING RSI

/*
const df = new DeltaFinancial();
const prices = [
  { open: 4598, close: 4600.65 },
  { open: 4600.65, close: 4486.18 },
  { open: 4486.18, close: 4513.98 },
  { open: 4513.98, close: 4525.03 },
  { open: 4525.03, close: 4551.17 },
  { open: 4551.17, close: 4614.84 },
  { open: 4614.84, close: 4569.56 },
  { open: 4569.56, close: 4548.71 },
  { open: 4548.71, close: 4376.55 },
  { open: 4376.55, close: 4393.08 },
  { open: 4393.08, close: 4379.44 },
  { open: 4379.44, close: 4379.07 },
  { open: 4379.07, close: 4190.12 },
  { open: 4190.12, close: 4233.3 },
  { open: 4233.3, close: 4350.03 },
  { open: 4350.03, close: 4148.34 },
  { open: 4148.34, close: 4089.26 },
  { open: 4089.26, close: 4190.46 },
  { open: 4190.46, close: 4324.12 },
  { open: 4324.12, close: 4310.33 },
  { open: 4310.33, close: 4429.59 },
  { open: 4429.59, close: 4447.13 },
  { open: 4447.13, close: 4493.4 },
  { open: 4493.4, close: 4443.14 },
  { open: 4443.14, close: 4548.06 },
  { open: 4548.06, close: 4582.83 },
  { open: 4582.83, close: 4574.68 },
  { open: 4574.68, close: 4628.96 },
];
*/
/*
const prices = [
  {
    open: 4740.6,
    high: 4748.8,
    low: 4741.3,
    close: 4747.5,
  },
  {
    open: 4747.5,
    high: 4747.7,
    low: 4746.6,
    close: 4747.6,
  },
  {
    open: 4747.6,
    high: 4747.7,
    low: 4736.5,
    close: 4739.2,
  },
  {
    open: 4739.2,
    high: 4746.2,
    low: 4739.2,
    close: 4745,
  },
  {
    open: 4745,
    high: 4746.2,
    low: 4742.9,
    close: 4746.2,
  },
  {
    open: 4746.2,
    high: 4747.4,
    low: 4745.6,
    close: 4745.7,
  },
  {
    open: 4745.7,
    high: 4745.8,
    low: 4733.5,
    close: 4733.5,
  },
  {
    open: 4733.5,
    high: 4742.9,
    low: 4732,
    close: 4742.9,
  },
  {
    open: 4742.9,
    high: 4744.1,
    low: 4741.6,
    close: 4744.1,
  },
  {
    open: 4744.1,
    high: 4772.7,
    low: 4744,
    close: 4764.2,
  },
  {
    open: 4764.2,
    high: 4765,
    low: 4756.4,
    close: 4765,
  },
  {
    open: 4765,
    high: 4766.5,
    low: 4759.3,
    close: 4759.3,
  },
  {
    open: 4759.3,
    high: 4759.9,
    low: 4752.3,
    close: 4756.4,
  },
  {
    open: 4756.4,
    high: 4761.7,
    low: 4756.4,
    close: 4758.9,
  },
  {
    open: 4758.9,
    high: 4758.8,
    low: 4757.6,
    close: 4757.6,
  },
  {
    open: 4757.6,
    high: 4770.9,
    low: 4757.1,
    close: 4769.7,
  },
  {
    open: 4769.7,
    high: 4789.1,
    low: 4768.9,
    close: 4789.1,
  },
  {
    open: 4789.1,
    high: 4789.1,
    low: 4774.2,
    close: 4774.2,
  },
  {
    open: 4774.2,
    high: 4779.5,
    low: 4768.5,
    close: 4771.6,
  },
  {
    open: 4771.6,
    high: 4771.5,
    low: 4768.7,
    close: 4771.1,
  },
  {
    open: 4771.1,
    high: 4774.6,
    low: 4760,
    close: 4760,
  },
  {
    open: 4760,
    high: 4768,
    low: 4759.1,
    close: 4763.1,
  },
  {
    open: 4763.1,
    high: 4765.5,
    low: 4759.6,
    close: 4763.7,
  },
  {
    open: 4763.7,
    high: 4763.8,
    low: 4757,
    close: 4757.1,
  },
  {
    open: 4757.1,
    high: 4763.1,
    low: 4756.9,
    close: 4763.1,
  },
  {
    open: 4763.1,
    high: 4763,
    low: 4762,
    close: 4762,
  },
  {
    open: 4762,
    high: 4762.5,
    low: 4761.1,
    close: 4761,
  },
  {
    open: 4761.1,
    high: 4769.3,
    low: 4761.1,
    close: 4769.3,
  },
  {
    open: 4769.3,
    high: 4773.1,
    low: 4769.3,
    close: 4772.9,
  },
  {
    open: 4772.9,
    high: 4797.5,
    low: 4772.9,
    close: 4797.5,
  },
  {
    open: 4797.5,
    high: 4797.8,
    low: 4779.2,
    close: 4779.2,
  },
  {
    open: 4779.2,
    high: 4786.4,
    low: 4778.5,
    close: 4785,
  },
  {
    open: 4785,
    high: 4791.8,
    low: 4783,
    close: 4784.8,
  },
];

for (let i = 0; i < prices.length; i += 1) {
  const priceSlice = prices.slice(0, i);
  const current = prices[i];

  const [ttr, tatr] = df.avgTrueRange(priceSlice, 14, current);
  const tr = utils.roundTo(ttr, 4);
  const atr = utils.roundTo(tatr, 4);
  prices[i].tr = tr;
  prices[i].atr = atr;
  console.log(`close: ${current.close}\ttr: ${tr}\t\tatr: ${atr}`);

  // const [gain, loss, rsi] = df.rsi(priceSlice, 14, current);
  // prices[i].rsiavggain = gain;
  // prices[i].rsiavgloss = loss;
  // console.log(`open: ${current.open}\tclose: ${current.close}\trsi: ${rsi}`);
}
*/
