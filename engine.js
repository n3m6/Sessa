const trade = require('./trade').Trade;
const strategy = require('./strategy').Strategy;
const db = require('./db').Db;
const orderlog = require('./orderlog').OrderLog;

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

  // const tTime = new Date(parseInt(timestamp, 10));

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
              // LOG update
              orderlog.update(timestamp, '-', orderType, close);
              // FIXME Move Trail Stop
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
