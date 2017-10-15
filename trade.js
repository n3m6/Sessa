const config = require('./config');
const bm = require('./bitmex').BitMEX;
const utils = require('./utils');
const db = require('./db').Db;

const Trade = function Trade() {};

function determineOrderAttributes(price, atr, orderType, balance) {
  // const toXBT = balance / 100000000;
  // const dollarValue = price * toXBT;
  // const bet = Math.round(dollarValue * config.margin * config.betSize);

  const balxbt = balance / 100000000;
  const bal = balxbt * price;
  console.log(`Balance: ${utils.roundTo(bal, 2)}`);
  const atrk = config.atrmultiplier * parseFloat(atr);
  console.log(`ATR: ${utils.roundTo(atr, 2)}`);
  let stopLossPosition = 1;
  let absLoss = -1;
  let lossVal = 1;
  const priceXBT = 1 / parseFloat(price);
  let stopXBT = 1;
  let diff = 1;
  let allocation = 1;

  if (orderType === 'LONG') {
    stopLossPosition = Math.round(parseFloat(price) - atrk);
    absLoss = absLoss * bal * config.maxLoss;
    stopXBT = 1 / stopLossPosition;
    diff = priceXBT - stopXBT;
    lossVal = diff * stopLossPosition;
    allocation = Math.round(absLoss / lossVal);
    const maxAlloc = Math.round(config.margin * config.maxBetSize * bal);
    allocation = allocation > maxAlloc ? maxAlloc : allocation;
    console.log(`Stop Loss Position: ${stopLossPosition}`);
    console.log(`Absolute Loss: ${absLoss}`);
    console.log(`Allocation: ${allocation}`);
    const balpercent = allocation / (bal * config.margin);
    console.log(`Balance % Used: ${utils.roundTo(balpercent * 100, 2)}%`);
  } else {
    stopLossPosition = Math.round(parseFloat(price) + atrk);
    absLoss = absLoss * bal * config.maxLoss;
    stopXBT = 1 / stopLossPosition;
    diff = stopXBT - priceXBT;
    lossVal = diff * stopLossPosition;
    allocation = Math.round(absLoss / lossVal);
    const maxAlloc = Math.round(config.margin * config.maxBetSize * bal);
    allocation = allocation > maxAlloc ? maxAlloc : allocation;
    console.log(`Stop Loss Position: ${stopLossPosition}`);
    console.log(`Absolute Loss: ${absLoss}`);
    console.log(`Allocation: ${allocation}`);
    const balpercent = allocation / (bal * config.margin);
    console.log(`Balance % Used: ${utils.roundTo(balpercent * 100, 2)}%`);
  }

  return [stopLossPosition, allocation];
}

Trade.prototype.init = function init() {
  bm.adjustMargin(config.margin);
};

Trade.prototype.openPosition = function openPosition(orderType, currentPrice, avgTrueRange) {
  return new Promise((resolve, reject) => {
    const side = orderType === 'LONG' ? 'Buy' : 'Sell';

    bm
      .getBalance()
      .then((balance) => {
        const [stopLossPosition, orderSize] = determineOrderAttributes(
          currentPrice,
          avgTrueRange,
          orderType,
          balance,
        );
        bm
          .marketOrder(side, orderSize)
          .then((response) => {
            this.setStopLoss(orderType, response.body.orderID, stopLossPosition);
            db
              .setOrderID(response.body.orderID)
              .catch(reply => console.error(`error setting order id${reply}`));
            resolve(response.body.orderID);
          })
          .catch(reject);
      })
      .catch(reject);
  });
};

Trade.prototype.closePosition = function closePosition(orderID) {
  return new Promise((resolve, reject) => {
    bm
      .closePosition(orderID)
      .then(bm.deleteUOrder(orderID))
      .then(resolve)
      .catch(reject);
  });
};

Trade.prototype.setStopLoss = function setStopLoss(side, orderID, stopPrice) {
  // stop Price should be a rounded integer for BitMEX
  console.log(`StopPrice: ${stopPrice}`);
  bm
    .setUStopLoss(side, stopPrice, orderID)
    .then(console.log('Stop Loss Assigned'))
    .catch(response => console.error(response.body));
};

exports.Trade = new Trade();
