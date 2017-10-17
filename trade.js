const config = require('./config');
const bm = require('./bitmex').BitMEX;
const db = require('./db').Db;
const orderlog = require('./orderlog').OrderLog;

const Trade = function Trade() {};

function determineOrderAttributes(price, atr, orderType, balance) {
  // const toXBT = balance / 100000000;
  // const dollarValue = price * toXBT;
  // const bet = Math.round(dollarValue * config.margin * config.betSize);

  const balxbt = balance / 100000000;
  const bal = balxbt * price;
  const atrk = config.atrmultiplier * parseFloat(atr);
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
  } else {
    stopLossPosition = Math.round(parseFloat(price) + atrk);
    absLoss = absLoss * bal * config.maxLoss;
    stopXBT = 1 / stopLossPosition;
    diff = stopXBT - priceXBT;
    lossVal = diff * stopLossPosition;
    allocation = Math.round(absLoss / lossVal);
    const maxAlloc = Math.round(config.margin * config.maxBetSize * bal);
    allocation = allocation > maxAlloc ? maxAlloc : allocation;
  }

  return [stopLossPosition, allocation];
}

Trade.prototype.init = function init() {
  bm.adjustMargin(config.margin);
  orderlog.init();
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
            // Set stop Loss on service provider
            this.setStopLoss(orderType, response.body.orderID, orderSize, stopLossPosition);

            // record the order id return from service provider
            db
              .setOrderID(response.body.orderID)
              .catch(reply => console.error(`error setting order id${reply}`));

            // record the positionsize
            db.setOrderSize(orderSize).catch(console.error);
            resolve(response.body.orderID);

            // LOG the Open position
            orderlog.open(Date.now(), 'OPEN', orderType, currentPrice, orderSize);
          })
          .catch(reject);
      })
      .catch(reject);
  });
};

Trade.prototype.closePosition = function closePosition(orderID, close) {
  return new Promise((resolve, reject) => {
    bm
      .closePosition(orderID)
      .then(bm.deleteUOrder(orderID))
      .then(orderlog.close(Date.now(), 'CLOSE', '-', close))
      .then(resolve)
      .catch(reject);
  });
};

Trade.prototype.setStopLoss = function setStopLoss(side, orderID, orderQty, stopPrice) {
  // stop Price should be a rounded integer for BitMEX
  bm
    .setUStopLoss(side, stopPrice, orderQty, orderID)
    .then(() => {
      // record stop loss price in db
      db.setStopLoss(stopPrice).catch(console.error);
    })
    .catch(console.error);
};

Trade.prototype.amendStoploss = function amendStoploss(newPrice) {
  // get stop price and insert new price into db
  db
    .getOrderID()
    .then((orderID) => {
      // if an order id is available
      if (orderID !== '' || orderID !== null || orderID !== undefined) {
        db
          .getOrderSize()
          .then((orderSize) => {
            bm
              .amendUStopLoss(orderID, orderSize, newPrice)
              .then(() => {
                // record change in the db
                db.setStopLoss(newPrice).catch(console.error);
              })
              .catch(console.error);
          })
          .catch(console.error);
        // console.log(orderID);
      }
    })
    .catch(console.error);
};

exports.Trade = new Trade();
