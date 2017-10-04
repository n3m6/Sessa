const config = require('./config');
const client = require('./dbconnection');

client.on('error', (err) => {
  console.log(`DB Error. Is DB available? ${err}`);
  throw err;
});

/*
for positions:
key     field       value
-------------------------
XBTUSD  activeTrade false
XBTUSD  orderID     ''
XBTUSD  orderType   ''
*/

const Db = function Db() {};

// set up simple get/set for db values
Db.prototype.getActiveTrade = function getActiveTrade() {
  return new Promise((resolve, reject) => {
    client.hget('XBTUSD', 'activeTrade', (err, reply) => {
      if (err) return reject(err);
      return resolve(reply);
    });
  });
};

Db.prototype.setActiveTrade = function setActiveTrade(activeTrade) {
  return new Promise((resolve, reject) => {
    client.hset('XBTUSD', 'activeTrade', activeTrade, (err, reply) => {
      if (err) return reject(err);
      return resolve(reply);
    });
  });
};

Db.prototype.setOrderID = function setOrderID(orderID) {
  return new Promise((resolve, reject) => {
    client.hset('XBTUSD', 'orderID', orderID, (err, reply) => {
      if (err) return reject(err);
      return resolve(reply);
    });
  });
};

Db.prototype.getOrderID = function getOrderID() {
  return new Promise((resolve, reject) => {
    client.hget('XBTUSD', 'orderID', (err, reply) => {
      if (err) return reject(err);
      return resolve(reply);
    });
  });
};

Db.prototype.getOrderType = function getOrderType() {
  return new Promise((resolve, reject) => {
    client.hget('XBTUSD', 'orderType', (err, reply) => {
      if (err) return reject(err);
      return resolve(reply);
    });
  });
};

Db.prototype.setOrderType = function setOrderType(orderType) {
  return new Promise((resolve, reject) => {
    client.hset('XBTUSD', 'orderType', orderType, (err, reply) => {
      if (err) return reject(err);
      return resolve(reply);
    });
  });
};

Db.prototype.getOneCandle = function getOneCandle(timestamp) {
  return new Promise((resolve, reject) => {
    const key = `${config.bitmex1MinPrefix}:${timestamp}`;
    const args = [key, 'timestamp', 'open', 'high', 'low', 'close', 'sma30', 'rsi', 'macd'];
    client.hmget(args, (err, reply) => {
      if (err) return reject(err);
      return resolve(reply);
    });
  });
};

Db.prototype.getFiveCandle = function getFiveCandle(timestamp) {
  return new Promise((resolve, reject) => {
    const key = `${config.bitmex5MinPrefix}:${timestamp}`;
    const args = [key, 'timestamp', 'open', 'high', 'low', 'close', 'sma30', 'rsi', 'macd'];
    client.hmget(args, (err, reply) => {
      if (err) return reject(err);
      return resolve(reply);
    });
  });
};

exports.Db = new Db();
