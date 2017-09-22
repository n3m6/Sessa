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
  bm.adjustMargin(config.margin);
};

Trade.prototype.openPosition = function openPosition(orderType, currentPrice, callback) {
  const side = orderType === 'LONG' ? 'Buy' : 'Sell';
  bm
    .getBalance()
    .then(balance => this.determineOrderQty(currentPrice, balance))
    .then(orderSize =>
      bm.marketOrder(side, orderSize).then((response) => {
        console.log('setting stop loss');
        this.setStopLoss(orderType, response.body.orderID, orderSize, currentPrice);
        callback(response.body.orderID);
      }))
    .catch(response => console.log(response));
};

Trade.prototype.closePosition = function closePosition(orderID) {
  // console.log(`completed transaction ${position.orderType}`);
  bm.closePosition(orderID).catch(response => console.log(response));
  // FIXME if the stop loss trigger is still in the db
  bm.deleteUOrder(orderID).catch(response => console.log(response));
};

function calculateStopLoss(side, lastPrice, margin, maxLoss, marginAllocation) {
  const accValue = marginAllocation / margin;
  const loss = accValue * maxLoss;
  const highWater = marginAllocation - loss; // maximum margin loss

  if (side === 'LONG') {
    const unitPrice = lastPrice / marginAllocation;
    return Math.round(unitPrice * highWater);
  }
  if (side === 'SHORT') {
    const inv = 1 / highWater;
    const unitPrice = inv * marginAllocation;
    return Math.round(unitPrice * lastPrice);
  }
  return 0;
}

Trade.prototype.setStopLoss = function setStopLoss(side, orderID, orderQty, lastPrice) {
  // stop Price should be a rounded integer for BitMEX
  const stopPrice = calculateStopLoss(side, lastPrice, config.margin, config.maxLoss, orderQty);
  console.log(`StopPrice: ${stopPrice}`);
  bm
    .setUStopLoss(side, stopPrice, orderID)
    .then(response => console.log(`stop loss assigned for ${response.body.orderID}`))
    .catch(response => console.error(response.body));
};

exports.Trade = new Trade();
