const trade = require('./trade').Trade;
const strategy = require('./strategy').Strategy;
const db = require('./db').Db;
const orderlog = require('./orderlog').OrderLog;
const config = require('./config');

const Engine = function Engine() {};

Engine.prototype.init = function init() {
  trade.init();
};

function enterTrade(timestamp, activeTrade, orderType, close, atr) {
  return new Promise((resolve, reject) => {
    trade
      .openPosition(orderType, close, atr)
      .then(orderID => db.enterTrade(orderID, activeTrade, orderType))
      .then(resolve)
      .catch(reply => reject(reply));
  });
}

function exitTrade(timestamp, close) {
  return new Promise((resolve, reject) => {
    db
      .getOrderID()
      .then((orderID) => {
        trade
          .closePosition(orderID, close)
          .then(() => db.exitTrade())
          .then(resolve)
          .catch(reject);
      })
      .catch(reject);
  });
}

function calcStopLossMovement(args, dbStop) {
  // calculate by how much we should trail the stop loss
  const { open, close, orderType } = args;

  // calc for LONG positions
  if (orderType === 'LONG') {
    if (close > open) {
      const candleSize = parseFloat(close) - parseFloat(open);
      const moveSize = Math.round(candleSize * config.stopTrail);
      const newPrice = dbStop + moveSize;
      return [true, newPrice];
    }
    return [false, dbStop];
  }

  // calc for SHORT positions
  if (open > close) {
    const candleSize = parseFloat(open) - parseFloat(close);
    const moveSize = Math.round(candleSize * config.stopTrail);
    const newPrice = dbStop - moveSize;
    return [true, newPrice];
  }
  return [false, dbStop]; // move: true or false, newprice
}

Engine.prototype.processTrade = function processTrade(lastCandle) {
  // eslint-disable-next-line
  const [timestamp, open, high, low, close, sma20, sma30, rsi, macd, tr, atr] = lastCandle;
  const args = {
    timestamp,
    open,
    high,
    low,
    close,
    sma20,
    sma30,
    rsi,
    macd,
    tr,
    atr,
  };

  db
    .getActiveTrade() // check if there's an active trade in the db
    .then((activeTrade) => {
      if (activeTrade === 'true') {
        // check whether we should end the trade
        db
          .getOrderType()
          .then((orderType) => {
            args.orderType = orderType;

            if (strategy.exit(args)) {
              exitTrade(timestamp, close)
                .then(() => {
                  // Chck whether we need to enter a new trade after exiting previous trade
                  const [at, ot] = strategy.enter(args);
                  // if an order needs to be placed
                  if (at === true) {
                    enterTrade(timestamp, at, ot, close, atr).catch(console.error);
                  }
                })
                .catch(reply => console.error(reply));
            } else {
              db
                .getStopLoss()
                .then((dbStop) => {
                  const [stopMove, newPrice] = calcStopLossMovement(args, dbStop);
                  if (stopMove) {
                    trade.amendStoploss(newPrice).catch(console.error);
                  }
                })
                .catch(console.error);
              // LOG update
              orderlog.update(timestamp, '-', orderType, close);
            }
          })
          .catch(console.error);
      } else {
        // check whether we should enter a trade
        const [at, ot] = strategy.enter(args);

        // if an order needs to be placed
        if (at === true) {
          enterTrade(timestamp, at, ot, close, atr).catch(console.error);
        }
      }
    })
    .catch(reply => console.error(`${reply}`));
};

Engine.prototype.oneMinuteProcessing = function oneMinuteProcessing(timestamp) {
  db
    .getOneCandle(timestamp)
    .then(reply => this.processTrade(reply))
    .catch(console.error);
};

Engine.prototype.fiveMinuteProcessing = function fiveMinuteProcessing(timestamp) {
  db
    .getFiveCandle(timestamp)
    .then(reply => this.processTrade(reply))
    .catch(console.error);
};

Engine.prototype.fifteenMinuteProcessing = function fifteenMinuteProcessing(timestamp) {
  db
    .getFifteenCandle(timestamp)
    .then(reply => this.processTrade(reply))
    .catch(console.error);
};

exports.Engine = new Engine();
