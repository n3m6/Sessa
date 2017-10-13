const trade = require('./trade').Trade;
const strategy = require('./strategy').Strategy;
const db = require('./db').Db;

const Engine = function Engine() {};

Engine.prototype.init = function init() {
  trade.init();
};

Engine.prototype.setOrderID = function setOrderID(orderID) {
  console.log(`Order ID: ${orderID}`);
  db.setOrderID(orderID).catch(reply => console.log(`error setting order id${reply}`));
};

Engine.prototype.processTrade = function processTrade(lastCandle) {
  // eslint-disable-next-line
  const [timestamp, open, high, low, close, sma20, sma30, rsi, macd, tr, atr] = lastCandle;

  const tTime = new Date(parseInt(timestamp, 10));
  // console.log(`ATR: ${atr}`);
  // console.log(lastCandle);

  db
    .getActiveTrade() // check if there's an active trade in the db
    .then((activeTrade) => {
      if (activeTrade === 'true') {
        // check whether we should end the trade
        db.getOrderType().then((orderType) => {
          console.log(`Active Trade ${tTime.toISOString()} ${orderType} ${close} ${sma30}`);

          if (strategy.threeGreenExit(close, sma20, orderType)) {
            console.log('----------- CLOSING POSITION -----------');
            console.log(`Time: ${tTime.toISOString()}`);
            console.log(`Reason: Exit Signal (price ${close} sma ${sma20}`);

            db
              .setActiveTrade('false')
              .then(db.setOrderType(''))
              .then(db.getOrderID().then((orderID) => {
                trade.closePosition(orderID);
              }))
              .then(console.log('----------------------------------------'))
              .catch(reply => console.log(`error ending trade${reply}`));
          }
        });
      } else {
        // check whether we should enter a trade
        let at = ''; // active trade
        let ot = ''; // order type
        [at, ot] = strategy.threeGreenEnter(close, sma20, macd, rsi);

        // if an order needs to be placed
        if (at === true) {
          console.log('----------- OPENING POSITION -----------');
          console.log(`Opening ${tTime.toISOString()} ${ot} ${close}`);
          // FIXME this should be re-ordered. open-position then set active trade
          db
            .setActiveTrade(at)
            .then(db.setOrderType(ot))
            .then(trade.openPosition(ot, close, atr, this.setOrderID))
            .catch(reply => console.log(`error while checking for entry signal${reply}`));
        }
      }
    })
    .catch(reply => console.error(`Error trying to get activeTrade from db ${reply}`));
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
