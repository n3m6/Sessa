const config = require('./config');
const client = require('./dbconnection');

client.on('error', (err) => {
  console.log(`DB Error. Is DB available? ${err}`);
  throw err;
});

const { bitMEXInstrument } = config;

/*
for positions:
key            field       value
-------------------------
BitMEX:XBTUSD  activeTrade false
BitMEX:XBTUSD  orderID     ''
BitMEX:XBTUSD  orderType   ''
BitMEX:XBTUSD  orderSize   ''
BitMEX:XBTUSD  stopLoss    ''
*/

const Db = function Db() {};

// set up simple get/set for db values
Db.prototype.getActiveTrade = function getActiveTrade() {
  return new Promise((resolve, reject) => {
    client.hget(bitMEXInstrument, 'activeTrade', (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

Db.prototype.setActiveTrade = function setActiveTrade(activeTrade) {
  return new Promise((resolve, reject) => {
    client.hset(bitMEXInstrument, 'activeTrade', activeTrade, (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

Db.prototype.setOrderID = function setOrderID(orderID) {
  return new Promise((resolve, reject) => {
    client.hset(bitMEXInstrument, 'orderID', orderID, (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

Db.prototype.getOrderID = function getOrderID() {
  return new Promise((resolve, reject) => {
    client.hget(bitMEXInstrument, 'orderID', (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

Db.prototype.setOrderSize = function setOrderSize(osize) {
  return new Promise((resolve, reject) => {
    client.hset(bitMEXInstrument, 'orderSize', osize, (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

Db.prototype.getOrderSize = function getOrderSize() {
  return new Promise((resolve, reject) => {
    client.hget(bitMEXInstrument, 'orderSize', (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

Db.prototype.getOrderType = function getOrderType() {
  return new Promise((resolve, reject) => {
    client.hget(bitMEXInstrument, 'orderType', (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

Db.prototype.setOrderType = function setOrderType(orderType) {
  return new Promise((resolve, reject) => {
    client.hset(bitMEXInstrument, 'orderType', orderType, (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

Db.prototype.getStopLoss = function getStopLoss() {
  return new Promise((resolve, reject) => {
    client.hget(bitMEXInstrument, 'stopLoss', (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

Db.prototype.setStopLoss = function setStopLoss(stopLoss) {
  return new Promise((resolve, reject) => {
    client.hset(bitMEXInstrument, 'stopLoss', stopLoss, (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

Db.prototype.enterTrade = function enterTrade(orderID, activeTrade, orderType) {
  return new Promise((resolve, reject) => {
    client
      .multi()
      .hset(bitMEXInstrument, 'activeTrade', activeTrade)
      .hset(bitMEXInstrument, 'orderType', orderType)
      .hset(bitMEXInstrument, 'orderID', orderID)
      .exec((err, replies) => {
        if (err) reject(err);
        resolve(replies);
      });
  });
};

Db.prototype.exitTrade = function exitTrade() {
  return new Promise((resolve, reject) => {
    client
      .multi()
      .hset(bitMEXInstrument, 'activeTrade', 'false')
      .hset(bitMEXInstrument, 'orderType', '')
      .exec((err, replies) => {
        if (err) reject(err);
        resolve(replies);
      });
  });
};

Db.prototype.getOneCandle = function getOneCandle(timestamp) {
  return new Promise((resolve, reject) => {
    const key = `${config.bitmex1MinPrefix}:${timestamp}`;
    const args = [
      key,
      'timestamp',
      'open',
      'high',
      'low',
      'close',
      'sma1',
      'sma2',
      'rsi',
      'macd',
      'tr',
      'atr',
    ];
    client.hmget(args, (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

Db.prototype.getFiveCandle = function getFiveCandle(timestamp) {
  return new Promise((resolve, reject) => {
    const key = `${config.bitmex5MinPrefix}:${timestamp}`;
    const args = [
      key,
      'timestamp',
      'open',
      'high',
      'low',
      'close',
      'sma1',
      'sma2',
      'rsi',
      'macd',
      'tr',
      'atr',
    ];
    client.hmget(args, (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

Db.prototype.getFifteenCandle = function getFifteenCandle(timestamp) {
  return new Promise((resolve, reject) => {
    const key = `${config.bitmex15MinPrefix}:${timestamp}`;
    const args = [
      key,
      'timestamp',
      'open',
      'high',
      'low',
      'close',
      'sma1',
      'sma2',
      'rsi',
      'macd',
      'tr',
      'atr',
    ];
    client.hmget(args, (err, reply) => {
      if (err) reject(err);
      resolve(reply);
    });
  });
};

exports.Db = new Db();
