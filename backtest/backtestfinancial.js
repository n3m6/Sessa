const utils = require('../utils.js');

const BacktestFinancial = function BacktestFinancial() {};

BacktestFinancial.prototype.sma = function sma(data, range, currClose) {
  if (data[0] != null) {
    const as = utils.arraySlice(range - 1, data);
    let total = as.reduce((sum, value) => sum + parseFloat(value.close), 0);
    total += parseFloat(currClose);
    const divider = as.length + 1;
    return utils.roundTo(total / divider, 4);
  }
  return currClose;
};

function trueRange(current, last) {
  const tmp = Math.max(
    Math.abs(current.high - current.low),
    Math.abs(current.high - last.close),
    Math.abs(last.close - current.low),
  );
  return tmp;
}

BacktestFinancial.prototype.avgTrueRange = function avgTrueRange(data, range, current) {
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

exports.BacktestFinancial = new BacktestFinancial();
