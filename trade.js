const utils = require('./utils.js');
const fin = require('./financial').Financial; // for testing only

const Trade = function Trade() {};

// Three Green Arrows strategy is a simple entry/exit strategy
// particularly useful for 5 minute scalping.
Trade.prototype.threeGreenEnter = function threeGreenEnter(close, sma, macd, rsi) {
  const rsiHigh = 60;
  const rsiLow = 40;

  if (sma > close && macd < 0 && rsi < rsiLow) {
    return [true, 'SHORT'];
  }
  if (sma < close && macd > 0 && rsi > rsiHigh) {
    return [true, 'LONG'];
  }
  return [false, ''];
};

Trade.prototype.threeGreenExit = function threeGreenExit(close, sma, position) {
  if (position.orderType === 'LONG') {
    if (close < sma) return true;
    return false;
  }
  if (position.orderType === 'SHORT') {
    if (close > sma) return true;

    return false;
  }
  return false;
};

Trade.prototype.placeOrder = function placeOrder(orderType) {
  // console.log(`order placed ${orderType}`);
  return true;
};

Trade.prototype.stopOrder = function stopOrder(position) {
  // console.log(`completed transaction ${position.orderType}`);
  return true;
};

exports.Trade = new Trade();

// TEST CODE BELOW
// FIXME: remove test code after testing

/* const positions = {
  XBTUSD: {
    activeTrade: false, // is there an active trade with this currency
    orderType: '', // long or short
    contracts: 0, // number of contracts bought
    value: 0, // total value of contracts in play
  },
};

const trade = new Trade();
const prices = [];

for (let i = 0; i < 500; i += 1) {
  let open = 0;
  let close = 0;
  let high = 0;
  let low = 0;

  if (i === 0) {
    open = Math.abs(utils.roundTo(utils.randomizer(10, 30), 2));
    high = Math.abs(utils.roundTo(utils.randomizer(open + 1, open + 7), 2));
    low = Math.abs(utils.roundTo(utils.randomizer(close - 7, close - 1), 2));
    close = Math.abs(utils.roundTo(utils.randomizer(high, low), 2));
  } else {
    open = prices[i - 1].close;
    high = Math.abs(utils.roundTo(utils.randomizer(open + 1, open + 7), 2));
    low = Math.abs(utils.roundTo(utils.randomizer(close - 7, close - 1), 2));
    close = Math.abs(utils.roundTo(utils.randomizer(high, low), 2));
  }
  prices.push({
    open,
    high,
    low,
    close,
  });
}

// Header
console.log('#\tOpen\tClose\tSMA\tMACD\tRSI\tPstn\tType');

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

  if (positions.XBTUSD.activeTrade) {
    // if there's an active trade check wither we should sell it now
    if (trade.threeGreenExit(currCandle.close, sma, positions.XBTUSD)) {
      positions.XBTUSD.activeTrade = false;
      positions.XBTUSD.orderType = '';

      // Stop the actual transaction
      trade.stopOrder(positions.XBTUSD);
    }
  } else {
    // check whether we should enter a trade
    [positions.XBTUSD.activeTrade, positions.XBTUSD.orderType] = trade.threeGreenEnter(
      currCandle.close,
      sma,
      macd,
      rsi,
    );
    if (positions.XBTUSD.activeTrade) {
      // if an order needs to place, place it here
      trade.placeOrder(positions.XBTUSD.orderType);
    }
  }

  console.log(`${i}\t${currCandle.open}\t${currCandle.close}\t${sma}\t${macd}\t${rsi}\t${positions.XBTUSD
    .activeTrade}\t${positions.XBTUSD.orderType}`);
} */
