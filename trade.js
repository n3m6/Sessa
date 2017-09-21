const config = require('./config');
const bm = require('./bitmex').BitMEX;

const Trade = function Trade() {};

Trade.prototype.determineOrderQty = function determineOrderQty(price, balance) {
  return new Promise((resolve, reject) => {
    const toXBT = balance / 100000000;
    const dollarValue = price * toXBT;
    const bet = Math.round(dollarValue * config.margin * config.betSize);
    if (price === 0 || balance < 1) return reject();
    return resolve(bet);
  });
};

Trade.prototype.init = function init() {
  // bm.adjustMargin(config.margin);
};

Trade.prototype.openPosition = function openPosition(orderType, currentPrice, callback) {
  const side = orderType === 'LONG' ? 'Buy' : 'Sell';
  bm
    .getBitMexBalance()
    .then(balance => this.determineOrderQty(currentPrice, balance))
    .then(orderSize => bm.marketOrder(side, orderSize))
    // FIXME remove these console logs
    .then(response => callback(response.body.orderID)) // make it return an array here
    .catch(error => console.error(`error ${error}`));
};

Trade.prototype.closePosition = function closePosition(orderID) {
  // console.log(`completed transaction ${position.orderType}`);
  bm.closePosition(orderID);
};

function calculateStopLoss(side, lastPrice, margin, maxLoss, marginAllocation) {
  const accValue = marginAllocation / margin;
  const loss = accValue * maxLoss;
  const highWater = marginAllocation - loss; // maximum margin loss

  if (side === 'LONG') {
    const unitPrice = lastPrice / marginAllocation;
    return unitPrice * highWater;
  }
  if (side === 'SHORT') {
    const inv = 1 / highWater;
    const unitPrice = inv * marginAllocation;
    console.log(`unit price ${unitPrice}`);
    return unitPrice * lastPrice;
  }
  return 0;
}

Trade.prototype.setStopLoss = function setStopLoss(side, orderID, orderQty, lastPrice) {
  const stopPrice = calculateStopLoss(side, lastPrice, config.margin, config.maxLoss, orderQty);
  bm
    .setStopLoss(side, orderID, stopPrice)
    .then(console.log)
    .catch(console.error);
};

exports.Trade = new Trade();

/*
functions to test
openPosition(orderType, currentPrice, callback)
setStopLoss(orderID, lastPrice)
closePosition(orderID)
*/

// FIXME trade is entirely broken

/* const tr = new Trade();
const side = 'SHORT';
const orderID = '5ba6ba46-6c0e-9630-7137-6c75463db404';
const orderQty = 500;
const lastPrice = '3871';

tr.setStopLoss(side, orderID, orderQty, lastPrice);
*/
