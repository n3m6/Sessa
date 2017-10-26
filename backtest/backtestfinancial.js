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

// using two ema functions because i'm picking out the previous val from data
// FIXME maybe fix this later

BacktestFinancial.prototype.ema1 = function ema1(data, range, close) {
  if (data.length + 1 < range) return close;

  if (data.length + 1 === range) {
    const sl = utils.arraySlice(range - 1, data);
    let total = sl.reduce((sum, val) => sum + parseFloat(val.close), 0);
    total += parseFloat(close);
    return total / range;
  }

  const prev = parseFloat(data[data.length - 1].ema1);
  const weight = 2 / (range + 1);
  let ema = (parseFloat(close) - prev) * weight;
  ema += prev;

  return ema;
};

BacktestFinancial.prototype.ema2 = function ema2(data, range, close) {
  if (data.length + 1 < range) return close;

  if (data.length + 1 === range) {
    const sl = utils.arraySlice(range - 1, data);
    let total = sl.reduce((sum, val) => sum + parseFloat(val.close), 0);
    total += parseFloat(close);
    return total / range;
  }

  const prev = parseFloat(data[data.length - 1].ema2);
  const weight = 2 / (range + 1);
  let ema = (parseFloat(close) - prev) * weight;
  ema += prev;

  return ema;
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

BacktestFinancial.prototype.donchian = function donchian(data, range, curr) {
  if (data[0] != null) {
    const sl = utils.arraySlice(range - 1, data);

    const hightmp = sl.reduce((sum, val) => Math.max(sum, val.high), 0);
    const high = Math.max(parseFloat(curr.high), hightmp);

    const lowtmp = sl.reduce(
      (sum, val) => Math.min(sum, parseFloat(val.low)),
      Number.MAX_SAFE_INTEGER,
    );
    const low = Math.min(parseFloat(curr.low), lowtmp);

    const mid = (high + low) / 2;

    return [high, mid, low];
  }

  // if this is the first element and the array is empty
  return [
    parseFloat(curr.high),
    (parseFloat(curr.high) + parseFloat(curr.low)) / 2,
    parseFloat(curr.low),
  ];
};

BacktestFinancial.prototype.bollinger = function bollinger(data, range, dev, close) {
  if (data[0] != null) {
    const as = utils.arraySlice(range - 1, data);
    let total = as.reduce((sum, value) => sum + parseFloat(value.close), 0);
    total += parseFloat(close);
    const divider = as.length + 1;
    const mid = utils.roundTo(total / divider, 2);

    const arr = as.map(val => parseFloat(val.close));
    const std = utils.stddev(arr);
    const thigh = std * dev;
    const tlow = std * dev;
    const high = utils.roundTo(mid + thigh, 2);
    const low = utils.roundTo(mid - tlow, 2);
    return [high, mid, low];
  }
  const mid = parseFloat(close);
  const std = utils.stddev([mid]);
  const thigh = std * dev;
  const tlow = std * dev;
  const high = utils.roundTo(mid + thigh, 2);
  const low = utils.roundTo(mid - tlow, 2);
  return [high, mid, low];
};

exports.BacktestFinancial = new BacktestFinancial();
