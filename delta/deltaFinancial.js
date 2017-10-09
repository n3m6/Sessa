const utils = require('../utils');
const config = require('../config');

const DeltaFinancial = function DeltaFinancial() {};

DeltaFinancial.prototype.sma = function sma(data, range, currClose) {
  if (data[0] != null) {
    const as = utils.arraySlice(range - 1, data);
    let total = as.reduce((sum, value) => sum + parseFloat(value.close), 0);
    total += parseFloat(currClose);
    const divider = as.length + 1;
    return utils.roundTo(total / divider, config.significant);
  }
  return currClose;
};

DeltaFinancial.prototype.rsi = function rsi(data, range, current) {
  if (data.length + 1 < range) return [1, 1, 1]; // ignore first part

  // FIXME this could be
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
    rsitmp = utils.roundTo(rsitmp, config.significant);

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
  rsitmp = utils.roundTo(rsitmp, config.significant);

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
    const ema12 = utils.roundTo(d, config.significant);
    const ema26 = utils.roundTo(d, config.significant);
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

  const ema12 = utils.roundTo(range1EMA, config.significant);
  const ema26 = utils.roundTo(range2EMA, config.significant);
  const signal = utils.roundTo(macdEMA(presignal, macdLine, signalRange), 4);
  const tmacd = utils.roundTo(macdLine - signal, 4);

  return [ema12, ema26, signal, tmacd];
};

exports.DeltaFinancial = new DeltaFinancial();

/*

// KEEP THIS FOR TESTING RSI

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

for (let i = 0; i < prices.length; i += 1) {
  const priceSlice = prices.slice(0, i);
  const current = prices[i];

  const [gain, loss, rsi] = df.rsi(priceSlice, 14, current);
  prices[i].rsiavggain = gain;
  prices[i].rsiavgloss = loss;
  console.log(`open: ${current.open}\tclose: ${current.close}\trsi: ${rsi}`);
}
*/
