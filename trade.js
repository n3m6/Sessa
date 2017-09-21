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
  // this.bitMexAdjustMargin(config.margin);
};

Trade.prototype.openPosition = function openPosition(orderType, currentPrice, callback) {
  const side = orderType === 'LONG' ? 'Buy' : 'Sell';
  bm
    .getBitMexBalance()
    .then(balance => this.determineOrderQty(currentPrice, balance))
    .then(orderSize => bm.bitMexMarketOrder(side, orderSize))
    // FIXME remove these console logs
    .then(response => callback(response.body.orderID)) // make it return an array here
    .catch(error => console.error(`error ${error}`));
};

// FIXME change this to a promise function
Trade.prototype.closePosition = function closePosition(orderID) {
  // console.log(`completed transaction ${position.orderType}`);
  bm.bitMexClosePosition(orderID);
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

Trade.prototype.setStopLoss = function setStopLoss(orderID, lastPrice) {
  // FIXME need special function to calculate stop price

  // const stopPrice = calculateStopLoss(lastPrice, config.maxLoss, marginAllocation);
  bm.bitMexSetStopLoss(orderID, stopPrice);
};

exports.Trade = new Trade();
