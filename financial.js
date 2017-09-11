// TODO: change all "price" to "close"
const Financial = function Financial() {};

function arraySlice(range, data) {
  return data.slice(data.length > range ? data.length - range : 0);
}

Financial.prototype.roundTo = function roundTo(n, digits) {
  let dig = 0;
  if (digits !== undefined) {
    dig = digits;
  }

  const multiplicator = dig ** 10;
  const no = parseFloat((n * multiplicator).toFixed(11));
  const test = Math.round(no) / multiplicator;
  return +test.toFixed(dig);
};

Financial.prototype.ma = function ma(range, data) {
  const as = arraySlice(range, data);
  const total = as.reduce((sum, value) => sum + value.price, 0);

  return total / as.length;
};

Financial.prototype.ema = function ema(range, data, prev) {
  const multiplier = 2 / (range + 1);
  const close = data[data.length - 1].price; // change to close later
  const prem = (close - prev) * multiplier;

  return prem + prev;
};

Financial.prototype.rsi = function rsi(data) {
  return 1;
};

// Choppiness Indicator -- to avoid trading in ranges
Financial.prototype.chop = function chop(data) {
  return 1;
};

Financial.prototype.macd = function macd(data) {
  return 1;
};

exports.Financial = new Financial();
