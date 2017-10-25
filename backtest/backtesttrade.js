const utils = require('../utils.js');
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
  if (chance > 7.9) {
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
  // Determines the current value of the trade

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

function trade(response, b, enter, exit, args) {
  let ma1 = 25;
  let ma2 = 40;
  let atr = 14;
  let ema1 = 8;
  let ema2 = 35;
  let dc1 = 20;
  let dc2 = 40;
  let bband1 = 20;
  let bband1dev = 1;
  let bband2 = 20;
  let bband2dev = 2;

  if (typeof args.ma1 !== 'undefined') {
    ma1 = args.ma1; // eslint-disable-line
  }

  if (typeof args.ma2 !== 'undefined') {
    ma2 = args.ma2; // eslint-disable-line
  }

  if (typeof args.ema1 !== 'undefined') {
    ema1 = args.ema1; // eslint-disable-line
  }

  if (typeof args.ema2 !== 'undefined') {
    ema2 = args.ema2; // eslint-disable-line
  }

  if (typeof args.atr !== 'undefined') {
    atr = args.atr; // eslint-disable-line
  }

  if (typeof args.dc1 !== 'undefined') {
    dc1 = args.dc1; // eslint-disable-line
  }

  if (typeof args.dc2 !== 'undefined') {
    dc2 = args.dc2; // eslint-disable-line
  }

  if (typeof args.bband1 !== 'undefined') {
    bband1 = args.bband1; // eslint-disable-line
  }
  if (typeof args.bband1dev !== 'undefined') {
    bband1dev = args.bband1dev; // eslint-disable-line
  }
  if (typeof args.bband2 !== 'undefined') {
    bband2 = args.bband2; // eslint-disable-line
  }
  if (typeof args.bband2dev !== 'undefined') {
    bband2dev = args.bband2dev; // eslint-disable-line
  }

  let balance = b;

  // trade information
  let activeTrade = false;
  let orderType = ''; // LONG or SHORT
  let orderSize = '';
  let entryPrice = '';
  let stopLoss = '';
  let tradeValue = '';

  // drawdown calculation
  let dhigh = balance;
  let dlow = balance;

  const trades = [];
  response.forEach((val) => {
    // check moving averages
    const currCandle = {
      timestamp: val.timestamp,
      open: val.open,
      high: val.high,
      low: val.low,
      close: val.close,
      trades: val.trades,
      volume: val.volume,
    };

    // Calculate all various indicators

    const tsma = fin.sma(trades, ma1, currCandle.close);
    currCandle.ma1 = utils.roundTo(tsma, 2);
    const tsma2 = fin.sma(trades, ma2, currCandle.close);
    currCandle.ma2 = utils.roundTo(tsma2, 2);

    const tema1 = fin.ema1(trades, ema1, currCandle.close);
    currCandle.ema1 = utils.roundTo(tema1, 2);
    const tema2 = fin.ema2(trades, ema2, currCandle.close);
    currCandle.ema2 = utils.roundTo(tema2, 2);

    const [ttr, tatr] = fin.avgTrueRange(trades, atr, currCandle);
    currCandle.tr = utils.roundTo(ttr, 2);
    currCandle.atr = utils.roundTo(tatr, 2);

    const [dc1high, dc1mid, dc1low] = fin.donchian(trades, dc1, currCandle);
    currCandle.dc1high = dc1high;
    currCandle.dc1mid = dc1mid;
    currCandle.dc1low = dc1low;

    const [dc2high, dc2mid, dc2low] = fin.donchian(trades, dc2, currCandle);
    currCandle.dc2high = dc2high;
    currCandle.dc2mid = dc2mid;
    currCandle.dc2low = dc2low;

    const [bband1high, bband1mid, bband1low] = fin.bollinger(
      trades,
      bband1,
      bband1dev,
      currCandle.close,
    );
    currCandle.bband1high = bband1high;
    currCandle.bband1mid = bband1mid;
    currCandle.bband1low = bband1low;

    const [bband2high, bband2mid, bband2low] = fin.bollinger(
      trades,
      bband2,
      bband2dev,
      currCandle.close,
    );
    currCandle.bband2high = bband2high;
    currCandle.bband2mid = bband2mid;
    currCandle.bband2low = bband2low;

    trades.push(currCandle);

    // Do stop loss here before taking or exiting trades

    // check entry and exit here
    if (trades.length > Math.max(ma1, ma2, atr, ema1, ema2)) {
      // skip first whatever rows depending on the maximum indicator value
      if (activeTrade) {
        // check for exit
        if (exit(currCandle, orderType)) {
          // exit here
          activeTrade = false;
          tradeValue = tradeValueCalc(currCandle.close, entryPrice, orderType, orderSize);
          balance += tradeValue;
          orderType = '    ';
          orderSize = 0;
          entryPrice = 0;

          tradeValue = 0; // change to zero after it's added to balance

          // calculate drawdown
          if (dhigh > balance) dhigh = balance;
          if (dlow < balance) dlow = balance;

          // recheck for entry on other side (after exiting previous trade)
          const [at, ot] = enter(currCandle);
          if (at) {
            // enter here
            activeTrade = true;
            orderType = ot; // LONG or SHORT
            [stopLoss, orderSize] = positionSize(
              currCandle.close,
              currCandle.atr,
              orderType,
              balance,
            );
            balance -= orderSize / kmargin;
            entryPrice = entryPriceCalc(currCandle.close, orderSize, orderType);
          }
        }
      } else {
        // check for entry
        const [at, ot] = enter(currCandle);
        if (at) {
          // enter here
          activeTrade = true;
          orderType = ot; // LONG or SHORT
          [stopLoss, orderSize] = positionSize(
            currCandle.close,
            currCandle.atr,
            orderType,
            balance,
          );
          balance -= orderSize / kmargin;
          entryPrice = entryPriceCalc(currCandle.close, orderSize, orderType);
        }
      }
    }

    // calculate tradeValue
    if (activeTrade) {
      tradeValue = tradeValueCalc(currCandle.close, entryPrice, orderType, orderSize);
    }
    /*
    // LOG Verbose details of all the trades
    const d = new Date(parseInt(currCandle.timestamp, 10));
    const ttime = d.toISOString();
    process.stdout.write(`${ttime}\t`);
    process.stdout.write(`${currCandle.open}\t`);
    process.stdout.write(`${currCandle.high}\t`);
    process.stdout.write(`${currCandle.low}\t`);
    process.stdout.write(`${currCandle.close}\t`);
    process.stdout.write(`${currCandle.bband1high}\t`);
    process.stdout.write(`${currCandle.bband1mid}\t`);
    process.stdout.write(`${currCandle.bband1low}\t`);
    process.stdout.write(`${activeTrade}\t`);
    process.stdout.write(`${orderType}\t`);
    process.stdout.write(`${orderSize}\t`);
    process.stdout.write(`${utils.roundTo(balance, 2)}\t`);
    process.stdout.write(`${utils.roundTo(tradeValue, 2)}\t`);
    process.stdout.write(`${utils.roundTo(balance + tradeValue, 2)}`);
    process.stdout.write('\n');
    */
  });

  // Return accumulated values

  if (activeTrade) {
    balance += tradeValue;
  }

  const drawdown = utils.roundTo((dhigh - dlow) / dhigh, 2);

  return [balance, drawdown];
}

module.exports = {
  katrmult,
  kmaxLoss,
  kmargin,
  kmaxBetSize,
  kfees,
  trade,
};
