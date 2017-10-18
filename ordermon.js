// const config = require('./config');
const orderlog = require('./orderlog').OrderLog;
const db = require('./db').Db;

const OrderMonitor = function OrderMonitor() {};

OrderMonitor.prototype.monitor = function monitor(data) {
  // loop through all the recent updates
  if (data.length > 0) {
    const curr = data[data.length - 1];

    const {
      orderID,
      clOrdID,
      // clOrdLinkID,
      // account,
      // symbol,
      side,
      // simpleOrderQty,
      orderQty,
      price,
      // displayQty,
      // stopPx,
      // pegOffsetValue,
      // pegPriceType,
      // currency,
      // settlCurrency,
      ordType,
      // timeInForce,
      // execInst,
      // contingencyType,
      // exDestination,
      ordStatus,
      // triggered,
      // workingIndicator,
      // ordRejReason,
      // simpleLeavesQty,
      // leavesQty,
      // simpleCumQty,
      // cumQty,
      avgPx,
      // multiLegReportingType,
      // text,
      // transactTime,
      timestamp,
    } = curr;
    // console.log(`${timestamp}\t${side}\t${price}\t${orderQty}\t${avgPx}\t${ordType}\t${ordStatus}\t${orderID}\t${clOrdID}`);

    if (ordType === 'Stop' && ordStatus === 'Filled') {
      // do order log here
      db
        .setActiveTrade('false')
        .then(db.setOrderType('').catch(console.error))
        // .then(console.log('----------------------------------------'))
        .catch(reply => console.error(`error ending trade${reply}`));
      orderlog.stoploss(price);
    }
  }
};

exports.OrderMonitor = new OrderMonitor();
