const positions = require('./models');
const utils = require('./utils.js');
const financial = require('./financial').Financial;
const trade = require('./trade').Trade;
const strategy = require('./strategy').Strategy;

const Engine = function Engine() {};

Engine.prototype.init = function init() {
  trade.init();
};

Engine.prototype.oneMinuteProcessing = function oneMinuteProcessing(data) {
  // ignore 1st 30 rows and let the data aggregate

  const lastCandle = data[data.length - 1];

  const rsi = utils.roundTo(financial.rsi(data, 14), 2);
  const macd = utils.roundTo(financial.macd(data, 12, 26, 9), 2);
  const sma = utils.roundTo(financial.sma(data, 20), 2);

  if (positions.XBTUSD.activeTrade) {
    // if there's an active trade check wither we should sell it now
    if (strategy.threeGreenExit(lastCandle.close, sma, positions.XBTUSD)) {
      positions.XBTUSD.activeTrade = false;
      positions.XBTUSD.orderType = '';

      // Stop the actual transaction

      // FIXME stop order should be an async call
      trade.openPosition(positions.XBTUSD);
    }
  } else if (data.length > 16) {
    // ignore the first few rows and let the data aggregate
    // check whether we should enter a trade
    [positions.XBTUSD.activeTrade, positions.XBTUSD.orderType] = strategy.threeGreenEnter(
      lastCandle.close,
      sma,
      macd,
      rsi,
    );

    if (positions.XBTUSD.activeTrade) {
      // if an order needs to place, place it here
      // FIXME place order should be an async clal
      trade.closePosition(positions.XBTUSD.orderType);
    }
  }

  console.log(`${data.length}\t${lastCandle.timestamp}\t${lastCandle.close}\t${lastCandle.volume}\t${sma}\t${rsi}\t${macd}\t${positions
    .XBTUSD.activeTrade}\t${positions.XBTUSD.orderType}`);
};

exports.Engine = new Engine();
