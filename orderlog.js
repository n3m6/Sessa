const colors = require('colors');

const OrderLog = function OrderLog() {};

OrderLog.prototype.init = function init() {
  // get the initial balance, stuff like that
  // IMPORTANT: use the db to store values, not inside objects
};

/*
Every line will have
- Timestamp
- OPEN/CLOSE/-
- LONG/SHORT
- Trade value
- % change since last time

*/

OrderLog.prototype.open = function open(timestamp, status, type, closePrice) {
  const tTime = new Date(parseInt(timestamp, 10));
  console.log(`${tTime}\t${status}\t${type}\t${closePrice}`);
};

OrderLog.prototype.close = function close(timestamp, status, type, closePrice) {
  const tTime = new Date(parseInt(timestamp, 10));
  console.log(`${tTime}\t${status}\t${type}\t${closePrice}`);
};

OrderLog.prototype.update = function update(timestamp, status, type, closePrice) {
  const tTime = new Date(parseInt(timestamp, 10));
  console.log(`${tTime}\t${status}\t${type}\t${closePrice}`);
};

exports.OrderLog = new OrderLog();
