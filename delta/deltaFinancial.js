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
  if (data.length < range) return [1, 1, 1]; // ignore first part

  if (data.length === range) {
    const tmp = data;
    tmp.push(current);
    const candles = utils.arraySlice(tmp, data);
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

    avggain = utils.roundTo(avggain, config.significant);
    avgloss = utils.roundTo(avgloss, config.significant);
    rsitmp = utils.roundTo(rsitmp, config.significant);

    return [avggain, avgloss, rsitmp];
  }

  // FIXME fix this part
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

  const RS = prevGain / prevLoss;
  const iRS = 100 / (1 + RS);

  let rsitmp = 100 - iRS;
  avggain = utils.roundTo(avggain, config.significant);
  avgloss = utils.roundTo(avgloss, config.significant);
  rsitmp = utils.roundTo(rsitmp, config.significant);

  return [avggain, avgloss, rsitmp];
};

exports.DeltaFinancial = new DeltaFinancial();
