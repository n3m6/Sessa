const config = require('../config');
const db = require('./deltadb.js').DeltaDB;
const df = require('./deltaFinancial.js').DeltaFinancial;

const DeltaRecord = function DeltaRecord() {
  console.log('TIME\t\t\t\tOPEN\tHIGH\tLOW\tCLOSE\tTRADES\tVOL\tVWAP\tSMA30\tRSI\tRSI_GA\tRSI_LO');
};

const bitmex1MinPrefix = config.bitmex1MinPrefix; // eslint-disable-line
// set up simple get/set for db values
DeltaRecord.prototype.process = function process(data) {
  const lastCandle = data[data.length - 1];
  const {
    timestamp, symbol, open, high, low, close, trades, volume, vwap,
  } = lastCandle;
  const jsDate = new Date(timestamp);
  const nixtime = jsDate.getTime();

  /* const {
    timestamp, side, size, price,
  } = lastCandle;
  const close = price;
  const jsDate = new Date(timestamp);
  const nixtime = jsDate.getTime(); */
  // console.log(nixtime);

  // console.log(`${nixtime}\t${timestamp}\t${symbol}\t${open}\t${high}\t${low}\t${close}\t${trades}\t${volume}\t${vwap}`);

  db
    .get1MinLast50()
    .then((response) => {
      if (response[0] === null || response.length < 30) {
        // IF check whether there are records in the db
        // console.log('records are empty');

        // IF records are empty start entering data
        const sma30 = df.sma(response, 30, close);
        const [avggain, avgloss, rsi] = df.rsi(response, config.rsi, lastCandle);
        db.insert1min(
          nixtime,
          open,
          high,
          low,
          close,
          trades,
          volume,
          vwap,
          sma30,
          rsi,
          avggain,
          avgloss,
        );
      } else {
        // ELSE we're working with existing data so get data
        //    IF data is inconsistent start fresh
        //    ELSE get latest batch calculate stuff and insert to db
        // console.log('records more than 30');

        const sma30 = df.sma(response, 30, close);
        const [avggain, avgloss, rsi] = df.rsi(response, config.rsi, lastCandle);
        db.insert1min(
          nixtime,
          open,
          high,
          low,
          close,
          trades,
          volume,
          vwap,
          sma30,
          rsi,
          avggain,
          avgloss,
        );

        // console.log(response);
      }
    })
    .catch(console.error);

  /* db
    .insert1Min(timestamp, symbol, open, high, low, close, trades, volume, vwap)
    .catch(console.error); */
};

exports.DeltaRecord = new DeltaRecord();
