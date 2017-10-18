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

            const { orderID } = response.body;
            console.log(`orderID: ${orderID}`);

            this.setStopLoss(orderType, orderID, orderSize, stopLossPosition)
              .then(() => {
                // record the order id return from service provider
                db
                  .setOrderID(orderID)
                  .then(() => {
                    // record the positionsize
                    db
                      .setOrderSize(orderSize)
                      .then(() => {
                        // LOG the Open position
                        orderlog.open(Date.now(), 'OPEN', orderType, currentPrice, orderSize);
                      })
                      .then(resolve(orderID))
                      .catch(reply => reject(reply));
                  })
                  .catch(reply => reject(reply));
              })
              .catch(reply => reject(reply));
          })
          .catch(reply => reject(reply));
      })
      .catch(reply => reject(reply));
  });
};

Trade.prototype.closePosition = function closePosition(orderID, close) {
  return new Promise((resolve, reject) => {
    bm
      .closePosition(orderID)
      .then(bm.deleteUOrder(orderID).catch(reject))
      .then(orderlog.close(Date.now(), 'CLOSE', '-', close))
      .then(resolve)
      .catch(reject);
  });
};

// FIXME this function was changed
Trade.prototype.setStopLoss = function setStopLoss(side, orderID, orderQty, stopPrice) {
  // stop Price should be a rounded integer for BitMEX
  return new Promise((resolve, reject) => {
    bm
      .setUStopLoss(side, stopPrice, orderQty, orderID)
      .then(() => {
        // record stop loss price in db
        db
          .setStopLoss(stopPrice)
          .then(() => resolve)
          .catch(reply => reject(reply));
      })
      .catch(reply => reject(reply));
  });
};

// FIXME this function was changed
Trade.prototype.amendStoploss = function amendStoploss(newPrice) {
  return new Promise((resolve, reject) => {
    db
      .getOrderID() // Get the order from DB
      // eslint-disable-next-line
      .then(orderID => {
        // if an order id is available
        if (orderID !== '' || orderID !== null || orderID !== undefined) {
          db
            .getOrderSize() // get the order size
            .then((orderSize) => {
              bm
                .amendUStopLoss(orderID, orderSize, newPrice) // amend stop loss
                .then(() => {
                  // record change in the db
                  db
                    .setStopLoss(newPrice)
                    .then(() => resolve)
                    .catch(reply => reject(reply));
                })
                .catch(reply => reject(reply));
            })
            .catch(reply => reject(reply));
        } else {
          return reject;
        }
      })
      .catch(reply => reject(reply));
  });
};

exports.Trade = new Trade();
