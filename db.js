const client = require('./dbconnection');

client.on('error', (err) => {
  console.log(`DB Error. Is DB available? ${err}`);
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

exports.Db = new Db();

// Test code
/* const db = new Db();
db
  .getActiveTrade()
  .then(reply => console.log(`active trade: ${reply}`))
  .catch(reply => console.error(`error getting active trade${reply}`));

db
  .setActiveTrade('true')
  .then(reply => console.log(`set active trade to true${reply}`))
  .catch(reply => console.error(`error setting active trade${reply}`));

db
  .setOrderID('101')
  .then(reply => console.log(`set order id to 101${reply}`))
  .catch(reply => console.error(`error setting id ${reply}`));

db
  .getOrderID()
  .then(reply => console.log(`id received ${reply}`))
  .catch(reply => console.error(`error setting id ${reply}`));

db
  .setOrderType('LONG')
  .then(reply => console.log(`set order type to buy${reply}`))
  .catch(reply => console.error(`error setting order type to buy${reply}`));

db
  .getOrderType()
  .then(reply => console.log(`get order type${reply}`))
  .catch(reply => console.error(`error getting order type${reply}`));
*/
