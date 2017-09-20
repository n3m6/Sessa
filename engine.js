// const positions = require('./models'); // use redis db instead
const utils = require('./utils.js');
const financial = require('./financial').Financial;
const trade = require('./trade').Trade;
const strategy = require('./strategy').Strategy;
const db = require('./db').Db;

const Engine = function Engine() {};

Engine.prototype.init = function init() {
  // TODO
  // 1. if redis essential values don't exist create them
  // 2. check if there are any open orders, and do what's necessary
  db
    .setActiveTrade('false')
    .then(db.setOrderID(''))
    .then(db.setOrderType(''))
    .catch(reply => console.error(`Error while initializing db values ${reply}`));

  trade.init();
};

Engine.prototype.setOrderID = function setOrderID(response) {
  console.log(`setting order id${response.body.orderID}`);
  db
    .setOrderID(response.body.orderID)
    .catch(reply => console.log(`error setting order id${reply}`));
};

Engine.prototype.oneMinuteProcessing = function oneMinuteProcessing(data) {
  const lastCandle = data[data.length - 1];

  const rsi = utils.roundTo(financial.rsi(data, 14), 2);
  const macd = utils.roundTo(financial.macd(data, 12, 26, 9), 2);
  const sma = utils.roundTo(financial.sma(data, 20), 2);

  console.log(`${data.length}\t${lastCandle.timestamp}\t${lastCandle.close}\t${lastCandle.volume}\t${sma}\t${rsi}\t${macd}`);

  db
    .getActiveTrade() // check if there's an active trade in the db
    .then((activeTrade) => {
      if (activeTrade === 'true') {
        // check whether we should end the trade
        console.log('active trade found');
        db.getOrderType().then((orderType) => {
          if (strategy.threeGreenExit(lastCandle.close, sma, orderType)) {
            console.log('received exit signal');
            db
              .setActiveTrade('false')
              .then(db.setOrderType(''))
              .then(db.getOrderID().then((orderID) => {
                trade.closePosition(orderID);
              }))
              .catch(reply => console.log(`error ending trade${reply}`));
          }
        });
      } else if (data.length > 16) {
        // check whether we should enter a trade
        let at = '';
        let ot = '';
        [at, ot] = strategy.threeGreenEnter(lastCandle.close, sma, macd, rsi);

        // if an order needs to be placed
        if (at === true) {
          console.log('recieved entry signal');
          db
            .setActiveTrade(at)
            .then(db.setOrderType(ot))
            .then(trade.openPosition(ot, lastCandle.close, this.setOrderID))
            .catch(reply => console.log(`error while checking for entry signal${reply}`));
        }
      }
    })
    .catch(reply => console.error(`Error trying to get activeTrade from db ${reply}`));
};

exports.Engine = new Engine();
