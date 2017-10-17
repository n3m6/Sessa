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

OrderLog.prototype.open = function open(timestamp, status, type, closePrice, orderSize) {
  const ttmp = new Date(parseInt(timestamp, 10));
  const tTime = colors.yellow(ttmp.toISOString());
  console.log(`${tTime}\t${status}\t${type}\t${closePrice}\t${orderSize}`);
};

OrderLog.prototype.close = function close(timestamp, status, type, closePrice) {
  const ttmp = new Date(parseInt(timestamp, 10));
  const tTime = colors.yellow(ttmp.toISOString());
  console.log(`${tTime}\t${status}\t${type}\t${closePrice}`);
};

OrderLog.prototype.update = function update(timestamp, status, type, closePrice) {
  const ttmp = new Date(parseInt(timestamp, 10));
  const tTime = colors.yellow(ttmp.toISOString());
  console.log(`${tTime}\t${status}\t${type}\t${closePrice}`);
};

OrderLog.prototype.stoploss = function stoploss(price) {
  const ttmp = new Date(Date.now());
  const tTime = colors.yellow(ttmp.toISOString());
  console.log(`${tTime}\tSTPLOSS\t\t${price}`);
};

OrderLog.prototype.liquidated = function liquidated(price) {
  const ttmp = new Date(Date.now());
  const tTime = colors.yellow(ttmp.toISOString());
  console.log(`${tTime}\tLIQD\t\t${price}`);
};

OrderLog.prototype.deleveraged = function deleveraged(price) {
  const ttmp = new Date(Date.now());
  const tTime = colors.yellow(ttmp.toISOString());
  console.log(`${tTime}\tDLEVRGD\t\t${price}`);
};

exports.OrderLog = new OrderLog();
