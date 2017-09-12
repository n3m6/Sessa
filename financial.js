// TODO: change all "price" to "close"
const Financial = function Financial() {
  this.prev12ema = 0;
  this.prev26ema = 0;
  this.prevSignal = 0;
};

function arraySlice(range, data) {
  return data.slice(data.length > range ? data.length - range : 0);
}

function randomizer(min, max) {
  return (rand = Math.random() * (max - min + 1) + min); //eslint-disable-line
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

// Relative Strength Index for measuring momentum of trend
Financial.prototype.rsi = function rsi(data) {
  return 1;
};

// Choppiness Indicator -- to avoid trading in ranges
Financial.prototype.chop = function chop(data) {
  return 1;
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
    const d = data[0];
    this.prev12ema = d;
    this.prev26ema = d;
    this.prevSignal = 0;
    return 1;
  }

  const range1EMA = macdEMA(this.prev12ema, data[data.length - 1], range1);
  const range2EMA = macdEMA(this.prev26ema, data[data.length - 1], range2);
  const macd = range1EMA - range2EMA;
  const signal = macdEMA(this.prevSignal, macd, signalRange);
  this.prev12ema = range1EMA;
  this.prev26ema = range2EMA;
  this.prevSignal = signal;

  // console.log(`${data[data.length - 1]}\t\t${macd}\t${signal}\t${macd - signal}`);
  return macd - signal;
};

exports.Financial = new Financial();

// test code
/* const fin = new Financial();
const prices = [];
for (let i = 0; i < 100; i += 1) {
  prices.push(fin.roundTo(randomizer(10, 20), 2));
}
console.log(`Full${JSON.stringify(prices)}`);

for (let i = 0; i < prices.length; i += 1) {
  let arr = [];
  if (prices.length === 1) {
    [arr] = prices;
  } else {
    arr = prices.slice(0, i + 1);
  }
  // console.log(JSON.stringify(arr));

  const f = fin.macd(arr, 12, 26, 9);
} */
