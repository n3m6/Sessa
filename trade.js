const utils = require('./utils.js');
const fin = require('./financial').Financial; // for testing only

const Trade = function Trade() {};

// Three Green Arrows strategy is a simple entry/exit strategy
// particularly useful for 5 minute scalping.
Trade.prototype.threeGreenEnter = function threeGreenEnter(close, sma, macd, rsi) {
  const rsiHigh = 60;
  const rsiLow = 40;

  if (sma > close && macd < 0 && rsi < rsiLow) return true;
  if (sma < close && macd > 0 && rsi > rsiHigh) return true;
  return false;
};

Trade.prototype.threeGreenExit = function threeGreenExit(close, sma, position) {
  return false;
};

exports.Trade = new Trade();

// TEST CODE BELOW
// FIXME: remove test code after testing

const trade = new Trade();
const prices = [];

for (let i = 0; i < 29; i += 1) {
  const open = utils.roundTo(utils.randomizer(10, 30), 2);
  const high = utils.roundTo(utils.randomizer(open + 1, open + 7), 2);
  const close = utils.roundTo(utils.randomizer(10, 30), 2);
  const low = utils.roundTo(utils.randomizer(close - 7, close - 1), 2);
  prices.push({
    open,
    high,
    low,
    close,
  });
}

// Header
console.log('Open\tClose\tSMA\tMACD\tRSI');

for (let i = 0; i < prices.length; i += 1) {
  let arr = [];
  if (prices.length === 1) {
    [arr] = prices;
  } else {
    arr = prices.slice(0, i + 1);
  }
  const currCandle = prices[i];

  const rsi = utils.roundTo(fin.rsi(arr, 14), 2);
  const macd = utils.roundTo(fin.macd(arr, 12, 26, 9), 2);
  const sma = utils.roundTo(fin.sma(arr, 20), 2);

  console.log(`${currCandle.open}\t${currCandle.close}\t${sma}\t${macd}\t${rsi}`);
}
