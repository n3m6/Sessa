// const positions = require('./models'); // use redis db instead
const utils = require('./utils.js');
const financial = require('./financial').Financial;
const trade = require('./trade').Trade;
const strategy = require('./strategy').Strategy;
const db = require('./db').Db;
const config = require('./config');

const Engine = function Engine() {
  this.fiveMinBin = [];
};

function getHigh(data) {
  return Math.max(
    data[data.length - 1].high,
    data[data.length - 2].high,
    data[data.length - 3].high,
    data[data.length - 4].high,
    data[data.length - 5].high,
  );
}

function getLow(data) {
  return Math.min(
    data[data.length - 1].low,
    data[data.length - 2].low,
    data[data.length - 3].low,
    data[data.length - 4].low,
    data[data.length - 5].low,
  );
}

function getVolume(data) {
  return (
    data[data.length - 1].volume +
    data[data.length - 2].volume +
    data[data.length - 3].volume +
    data[data.length - 4].volume +
    data[data.length - 5].volume
  );
}

function getTrades(data) {
  return (
    data[data.length - 1].trades +
    data[data.length - 2].trades +
    data[data.length - 3].trades +
    data[data.length - 4].trades +
    data[data.length - 5].trades
  );
}

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

Engine.prototype.setOrderID = function setOrderID(orderID) {
  console.log(`recording order id in db ${orderID}`);
  db.setOrderID(orderID).catch(reply => console.log(`error setting order id${reply}`));
};

Engine.prototype.processTrade = function processTrade(lastCandle, length, rsi, macd, sma) {
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
      } else if (length > config.rowSkip) {
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

Engine.prototype.oneMinuteProcessing = function oneMinuteProcessing(data) {
  const lastCandle = data[data.length - 1];
  const rsi = utils.roundTo(financial.rsi(data, config.rsi), 2);
  const macd = utils.roundTo(
    financial.macd(data, config.macd.line1, config.macd.line2, config.macd.signal),
    2,
  );
  const sma = utils.roundTo(financial.sma(data, config.sma), 2);

  console.log(`${data.length}\t${lastCandle.timestamp}\t${lastCandle.close}\t${lastCandle.volume}\t${sma}\t${rsi}\t${macd}`);

  // Send to process to handle the data
  this.processTrade(lastCandle, data.length, rsi, macd, sma);
};

Engine.prototype.fiveMinuteProcessing = function fiveMinuteProcessing(data) {
  // console.log(JSON.stringify(data[data.length - 1]));
  if (data.length % 5 === 0) {
    // console.log('5 min bin triggered');
    const block = {};
    block.open = data[data.length - 5].open;
    block.high = getHigh(data);
    block.low = getLow(data);
    block.close = data[data.length - 1].close;
    block.volume = getVolume(data);
    block.trades = getTrades(data);
    block.timestamp = data[data.length - 1].timestamp;
    this.fiveMinBin.push(block);

    const lastCandle = block;
    const rsi = utils.roundTo(financial.rsi(this.fiveMinBin, config.rsi), 2);
    const macd = utils.roundTo(
      financial.macd(this.fiveMinBin, config.macd.line1, config.macd.line2, config.macd.signal),
      2,
    );
    const sma = utils.roundTo(financial.sma(this.fiveMinBin, config.sma), 2);

    console.log(`${this.fiveMinBin
      .length}\t${lastCandle.timestamp}\t${lastCandle.close}\t${lastCandle.volume}\t${sma}\t${rsi}\t${macd}`);

    // Send to processing
    this.processTrade(lastCandle, this.fiveMinBin.length, rsi, macd, sma);
  }
};

exports.Engine = new Engine();

// FIXME TEST code remove later
/*
const engine = new Engine();
const data = [];
const start = 3600;
const stop = 3650;

for (let i = 0; i < 260; i += 1) {
  if (i === 0) {
    const block = {};
    block.open = utils.roundTo(utils.randomizer(start, stop), 2);
    block.high = utils.roundTo(utils.randomizer(start + 50, stop + 80), 2);
    block.low = utils.roundTo(utils.randomizer(start - 50, stop - 80), 2);
    block.close = utils.roundTo(utils.randomizer(start, stop), 2);
    block.volume = Math.round(utils.randomizer(2000, 200000));
    block.trades = Math.round(block.volume / 532);
    data.push(block);
  } else {
    const block = {};
    block.open = data[data.length - 1].close;
    block.high = utils.roundTo(
      utils.randomizer(data[data.length - 1].close + 1, data[data.length - 1].close + 50),
      2,
    );
    block.low = utils.roundTo(
      utils.randomizer(data[data.length - 1].close - 1, data[data.length - 1].close - 50),
      2,
    );
    block.close = utils.roundTo(
      utils.randomizer(data[data.length - 1].close - 50, data[data.length - 1].close + 50),
      2,
    );
    block.volume = Math.round(utils.randomizer(2000, 200000));
    block.trades = Math.round(block.volume / 532);
    data.push(block);
  }
}
console.log('OPEN\tHIGH\tLOW\tCLOSE\tVOLUME\tTRADES');

// data.forEach((val) => {
//  console.log(`${val.open}\t${val.high}\t${val.low}\t${val.close}\t${val.volume}\t${val.trades}`);
//});

for (let i = 0; i < data.length; i += 1) {
  const arr = data.slice(0, i + 1);

  engine.fiveMinuteProcessing(arr);

  // console.log(JSON.stringify(arr));
}
*/
