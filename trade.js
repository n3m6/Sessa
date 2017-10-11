const config = require('./config');
const bm = require('./bitmex').BitMEX;

const Trade = function Trade() {};

Trade.prototype.determineOrderQty = function determineOrderQty(price, atr, orderType, balance) {
  return new Promise((resolve, reject) => {
    // const toXBT = balance / 100000000;
    // const dollarValue = price * toXBT;
    // const bet = Math.round(dollarValue * config.margin * config.betSize);
    const atrk = config.atrmultiplier * atr;
    let stopLossPosition = 1;
    let absLoss = -1;
    let lossVal = 1;
    const priceXBT = 1 / price;
    let stopXBT = 1;
    let diff = 1;
    let allocation = 1;

    if (orderType === 'LONG') {
      stopLossPosition = price - atrk;
      absLoss = absLoss * balance * config.maxLoss;
      stopXBT = 1 / stopLossPosition;
      diff = priceXBT - stopXBT;
      lossVal = diff * stopLossPosition;
      allocation = Math.round(absLoss / lossVal);
      const maxAlloc = Math.round(config.margin * config.maxBetSize * balance);
      allocation = allocation > maxAlloc ? maxAlloc : allocation;
      console.log(`Stop Loss Position: ${stopLossPosition}`);
      console.log(`Absolute Loss: ${absLoss}`);
      console.log(`Loss Value (XBT): ${lossVal}`);
      console.log(`Allocation: ${allocation}`);
      console.log(`Balance % Used: ${allocation / (balance * config.margin)})`);
    } else {
      stopLossPosition = price + atrk;
      absLoss = absLoss * balance * config.maxLoss;
      stopXBT = 1 / stopLossPosition;
      diff = stopXBT - priceXBT;
      lossVal = diff * stopLossPosition;
      allocation = Math.round(absLoss / lossVal);
      const maxAlloc = Math.round(config.margin * config.maxBetSize * balance);
      allocation = allocation > maxAlloc ? maxAlloc : allocation;
      console.log(`Stop Loss Position: ${stopLossPosition}`);
      console.log(`Absolute Loss: ${absLoss}`);
      console.log(`Loss Value (XBT): ${lossVal}`);
      console.log(`Allocation: ${allocation}`);
      console.log(`Balance % Used: ${allocation / (balance * config.margin)})`);
    }

    if (price === 0 || balance < 1) return reject();
    return resolve(allocation);
  });
};

Trade.prototype.init = function init() {
  bm.adjustMargin(config.margin);
};

Trade.prototype.openPosition = function openPosition(
  orderType,
  currentPrice,
  avgTrueRange,
  callback,
) {
  const side = orderType === 'LONG' ? 'Buy' : 'Sell';
  bm
    .getBalance()
    .then(balance => this.determineOrderQty(currentPrice, avgTrueRange, orderType, balance))
    .then(orderSize =>
      bm.marketOrder(side, orderSize).then((response) => {
        // console.log('setting stop loss');
        this.setStopLoss(orderType, response.body.orderID, orderSize, currentPrice, avgTrueRange);
        callback(response.body.orderID);
      }))
    .catch(response => console.log(response.body));
};

Trade.prototype.closePosition = function closePosition(orderID) {
  bm.closePosition(orderID).catch(response => console.log(response.body));
  // FIXME if the stop loss trigger is still in the db
  bm.deleteUOrder(orderID).catch(response => console.log(response.body));
};

/*
function calculateFixedStopLoss(side, lastPrice, margin, maxLoss, marginAllocation) {
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
*/

function calculateVarStopLoss(side, lastPrice, atr) {
  const atrk = atr * config.atrmultiplier;

  if (side === 'LONG') {
    return lastPrice - atrk;
  }
  // else
  return lastPrice + atrk;
}

Trade.prototype.setStopLoss = function setStopLoss(side, orderID, orderQty, lastPrice, atr) {
  // stop Price should be a rounded integer for BitMEX
  const stopPrice = calculateVarStopLoss(side, lastPrice, atr);
  console.log(`StopPrice: ${stopPrice}`);
  bm
    .setUStopLoss(side, stopPrice, orderID)
    .then(console.log('Stop Loss Assigned'))
    .catch(response => console.error(response.body));
};

exports.Trade = new Trade();
