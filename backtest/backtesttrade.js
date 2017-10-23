const utils = require('../utils.js');
const strat = require('./backteststrategy.js').BacktestStrategy;
const fin = require('./backtestfinancial.js').BacktestFinancial;

// config constants
const katrmult = 2;
const kmaxLoss = 0.02;
const kmargin = 25;
const kmaxBetSize = 0.15;
const kfees = 0.00075;

function positionSize(price, atr, orderType, balance) {
  // Position size is calculated based on the Average True Range (ATR)
  // This is volatility based position sizing
  // This may also be known as Fixed Stop Variable Position

  const bal = balance;
  const atrk = katrmult * parseFloat(atr);
  let stopLossPosition = 1;
  let absLoss = -1;
  let lossVal = 1;
  const priceXBT = 1 / parseFloat(price);
  let stopXBT = 1;
  let diff = 1;
  let allocation = 1;

  if (orderType === 'LONG') {
    stopLossPosition = Math.round(parseFloat(price) - atrk);
    absLoss = absLoss * bal * kmaxLoss;
    stopXBT = 1 / stopLossPosition;
    diff = priceXBT - stopXBT;
    lossVal = diff * stopLossPosition;
    allocation = Math.round(absLoss / lossVal);
    const maxAlloc = Math.round(kmargin * kmaxBetSize * bal);
    allocation = allocation > maxAlloc ? maxAlloc : allocation;
  } else {
    stopLossPosition = Math.round(parseFloat(price) + atrk);
    absLoss = absLoss * bal * kmaxLoss;
    stopXBT = 1 / stopLossPosition;
    diff = stopXBT - priceXBT;
    lossVal = diff * stopLossPosition;
    allocation = Math.round(absLoss / lossVal);
    const maxAlloc = Math.round(kmargin * kmaxBetSize * bal);
    allocation = allocation > maxAlloc ? maxAlloc : allocation;
  }

  return [stopLossPosition, allocation];
}

function feeCalc(orderSize, price) {
  // market order fees based on BitMEX
  const fee = orderSize * kfees;
  const currxbt = 1 / price;
  const totalValue = orderSize * currxbt;
  const feeVal = 1 / (totalValue / fee);
  return feeVal;
}

function slippageCalc() {
  // Market trades are inaccurate and you may not always get the best entry
  // Include slippage calculation to make it more real
  const slip = utils.randomizer(5, 30);
  const chance = utils.randomizer(0.01, 10);
  if (chance > 5.9) {
    return slip;
  }
  return 0;
}

function entryPriceCalc(price, orderSize, orderType) {
  // Include FEES and SLIPPAGE

  const p = parseFloat(price);

  if (orderType === 'LONG') {
    const feeVal = feeCalc(orderSize, p);
    const slip = slippageCalc(p);

    return p + feeVal + slip;
  }

  const feeVal = feeCalc(orderSize, p);
  const slip = slippageCalc(p);

  return p - feeVal - slip;
}

function tradeValueCalc(price, entryPrice, orderType, orderSize) {
  let tradeValue = 0;
  if (orderType === 'LONG') {
    const ent = 1 / entryPrice;
    const ext = 1 / price;
    const v = ent - ext;
    const tval = v * orderSize * price;
    const marginUsed = orderSize / kmargin;
    tradeValue = marginUsed + tval;
  } else {
    const ent = 1 / entryPrice;
    const ext = 1 / price;
    const v = ext - ent;
    const tval = v * orderSize * price;
    const marginUsed = orderSize / kmargin;
    tradeValue = marginUsed + tval;
  }
  return tradeValue;
}

/** ********* STRATEGIES *********** */

function simpleCrossOver(response, ma, atrVal, b) {
  let balance = b;

  // trade information
  let activeTrade = false;
  let orderType = ''; // LONG or SHORT
  let orderSize = '';
  let entryPrice = '';
  let stopLoss = '';
  let tradeValue = '';

  const trades = [];
  response.forEach((val) => {
    // check moving averages
    const tmp = {
      timestamp: val.timestamp,
      open: val.open,
      high: val.high,
      low: val.low,
      close: val.close,
      trades: val.trades,
      volume: val.volume,
    };

    const tsma = fin.sma(trades, ma, tmp.close);
    tmp.ma = utils.roundTo(tsma, 2);
    const [ttr, tatr] = fin.avgTrueRange(trades, atrVal, tmp);
    tmp.tr = utils.roundTo(ttr, 2);
    tmp.atr = utils.roundTo(tatr, 2);

    trades.push(tmp);

    // Do stop loss here before taking or exiting trades

    // check entry and exit here
    if (trades.length > Math.max(ma, atrVal)) {
      // skip first 16 rows
      if (activeTrade) {
        // check for exit
        if (strat.simpleCrossOverExit(tmp.open, tmp.close, tmp.ma, orderType)) {
          // exit here
          activeTrade = false;
          balance += tradeValue; // change this to plus or minus later
          orderType = '    ';
          orderSize = 0;
          entryPrice = 0;

          // recheck for entry on other side
          const [at, ot] = strat.simpleCrossOverEnter(tmp.open, tmp.close, tmp.ma);
          if (at) {
            // enter here
            activeTrade = true;
            orderType = ot; // LONG or SHORT
            [stopLoss, orderSize] = positionSize(tmp.close, tmp.atr, orderType, balance);
            balance -= orderSize / kmargin;
            entryPrice = entryPriceCalc(tmp.close, orderSize, orderType);
          }
        }
      } else {
        // check for entry
        const [at, ot] = strat.simpleCrossOverEnter(tmp.open, tmp.close, tmp.ma);
        if (at) {
          // enter here
          activeTrade = true;
          orderType = ot; // LONG or SHORT
          [stopLoss, orderSize] = positionSize(tmp.close, tmp.atr, orderType, balance);
          balance -= orderSize / kmargin;
          entryPrice = entryPriceCalc(tmp.close, orderSize, orderType);
        }
      }
    }

    // calculate tradeValue
    if (activeTrade) {
      tradeValue = tradeValueCalc(tmp.close, entryPrice, orderType, orderSize);
    }

    /*
    const d = new Date(parseInt(tmp.timestamp, 10));
    const ttime = d.toISOString();
    console.log(`${ttime}\t${tmp.open}\t${tmp.high}\t${tmp.low}\t${tmp.close}\t${tmp.ma}\t${activeTrade}\t${orderType}\t${orderSize}\t${utils.roundTo(
      balance,
      2,
    )}\t${utils.roundTo(tradeValue, 2)}\t${utils.roundTo(balance + tradeValue, 2)}`);
    */
  });

  return balance + tradeValue;
}

/** ******************************** */

module.exports = {
  katrmult,
  kmaxLoss,
  kmargin,
  kmaxBetSize,
  kfees,
  simpleCrossOver,
};
