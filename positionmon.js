// const config = require('./config');
const orderlog = require('./orderlog').OrderLog;
const db = require('./db').Db;

const PositionMonitor = function PositionMonitor() {};

PositionMonitor.prototype.monitor = function monitor(data) {
  // loop through all the recent updates
  if (data.length > 0) {
    const curr = data[data.length - 1];
    // console.log(curr);

    const {
      // account,
      // symbol,
      // currency,
      // underlying,
      // quoteCurrency,
      // commission,
      // initMarginReq,
      // maintMarginReq,
      // riskLimit,
      // leverage,
      // crossMargin,
      // deleveragePercentile,
      // rebalancedPnl,
      // prevRealisedPnl,
      // prevUnrealisedPnl,
      // prevClosePrice,
      // openingTimestamp,
      // openingQty,
      // openingCost,
      // openingComm,
      // openOrderBuyQty,
      // openOrderBuyCost,
      // openOrderBuyPremium,
      // openOrderSellQty,
      // openOrderSellCost,
      // openOrderSellPremium,
      // execBuyQty,
      // execBuyCost,
      // execSellQty,
      // execSellCost,
      // execQty,
      // execCost,
      // execComm,
      // currentTimestamp,
      // currentQty,
      // currentCost,
      // currentComm,
      // realisedCost,
      // unrealisedCost,
      // grossOpenCost,
      // grossOpenPremium,
      // grossExecCost,
      isOpen, //
      // markPrice,
      // markValue,
      // riskValue,
      // homeNotional,
      // foreignNotional,
      posState, // Deleverage, Liquidation
      // posCost,
      // posCost2,
      // posCross,
      // posInit,
      // posComm,
      // posLoss,
      // posMargin,
      // posMaint,
      // posAllowance,
      // taxableMargin,
      // initMargin,
      // maintMargin,
      // sessionMargin,
      // targetExcessMargin,
      // varMargin,
      // realisedGrossPnl,
      // realisedTax,
      // realisedPnl,
      // unrealisedGrossPnl,
      // longBankrupt,
      // shortBankrupt,
      // taxBase,
      // indicativeTaxRate,
      // indicativeTax,
      // unrealisedTax,
      // unrealisedPnl,
      // unrealisedPnlPcnt,
      // unrealisedRoePcnt,
      // simpleQty,
      // simpleCost,
      // simpleValue,
      // simplePnl,
      // simplePnlPcnt,
      // avgCostPrice,
      avgEntryPrice, //
      // breakEvenPrice,
      // marginCallPrice,
      liquidationPrice, //
      // bankruptPrice,
      // timestamp,
      // lastPrice,
      // lastValue,
    } = curr;

    /*
    if (isOpen) {
      console.log(`Entry price: ${avgEntryPrice}\tLiquidation price: ${liquidationPrice}`);
    }
    */

    // Check whether position was deleveraged
    if (posState === 'Deleverage') {
      db
        .setActiveTrade('false')
        .then(db.setOrderType('').catch(console.error))
        .catch(reply => console.error(`error ending trade${reply}`));

      // LOG
      orderlog.deleveraged(liquidationPrice);
    }

    // check whether position was liquidated
    if (posState === 'Liquidation') {
      db
        .setActiveTrade('false')
        .then(db.setOrderType('').catch(console.error))
        .catch(reply => console.error(`error ending trade${reply}`));

      // LOG
      orderlog.liquidated(liquidationPrice);
    }
  }
};

exports.PositionMonitor = new PositionMonitor();
