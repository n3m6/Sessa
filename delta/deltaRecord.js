const config = require('../config');
const db = require('./deltadb.js').DeltaDB;
const df = require('./deltaFinancial.js').DeltaFinancial;
const utils = require('../utils');

const DeltaRecord = function DeltaRecord() {
  console.log('TIME\t\t\t\tOPEN\tHIGH\tLOW\tCLOSE\tTRADES\tVOL\tVWAP\tSMA30\tRSI\tRSI_GA\tRSI_LO\tMACD12\tMACD26\tSGNL\tMACD');
};

const bitmex1MinPrefix = config.bitmex1MinPrefix; // eslint-disable-line

function getHigh(data) {
  let high = 0;
  for (let i = 0; i < data.length; i += 1) {
    high = data[i].high > high ? data[i].high : high;
  }
  return high;
}

function getLow(data) {
  let low = data[0].low; // eslint-disable-line
  for (let i = 0; i < data.length; i += 1) {
    low = data[i].low < low ? data[i].low : low;
  }
  return low;
}

function getTrades(data) {
  let trades = 0;
  for (let i = 0; i < data.length; i += 1) {
    trades += parseInt(data[i].trades, 10);
  }
  return trades;
}

function getVolume(data) {
  let volume = 0;
  for (let i = 0; i < data.length; i += 1) {
    volume += parseInt(data[i].volume, 10);
  }
  return volume;
}

function fiveMinuteProcessing(lastFive) {
  const openFive = lastFive[0].open;
  const highFive = getHigh(lastFive);
  const lowFive = getLow(lastFive);
  const closeFive = lastFive[lastFive.length - 1].close;
  const tradesFive = getTrades(lastFive);
  const volumeFive = getVolume(lastFive);
  return [openFive, highFive, lowFive, closeFive, tradesFive, volumeFive];
}
// set up simple get/set for db values
DeltaRecord.prototype.process = function process(data) {
  const lastCandle = data[data.length - 1];
  const {
    timestamp,
    symbol, // eslint-disable-line
    open,
    high,
    low,
    close,
    trades,
    volume,
    vwap,
  } = lastCandle;
  const jsDate = new Date(timestamp);
  const nixtime = jsDate.getTime();

  db
    .get1MinLast50()
    .then((response) => {
      // IF check whether there are records in the db
      // console.log('records are empty');
      // IF records are empty start entering data

      let lastTime = ''; // timestamp of the last entry in db
      try {
        if (response[response.length - 1].timestamp !== null) {
          lastTime = response[response.length - 1].timestamp;
        }
      } catch (e) {
        lastTime = '';
      }

      // IF it's a new record not an entry that already exists
      if (parseInt(nixtime, 10) !== parseInt(lastTime, 10)) {
        const sma30 = df.sma(response, 30, close);
        const [rsiavggain, rsiavgloss, rsi] = df.rsi(response, config.rsi, lastCandle);
        const [mema12, mema26, msignal, macd] = df.macd(
          response,
          config.macd.line1,
          config.macd.line2,
          config.macd.signal,
          lastCandle,
        );

        const args = {
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
          rsiavggain,
          rsiavgloss,
          mema12,
          mema26,
          msignal,
          macd,
        };
        // insert into db
        db.insert1min(args).catch(console.error);

        // Processing trades at 5 min bins
        if (jsDate.getMinutes() % 5 === 0) {
          const lastFive = utils.arraySlice(4, response);
          lastFive.push(args);

          // console.log(JSON.stringify(lastFive));
          const [
            openFive,
            highFive,
            lowFive,
            closeFive,
            tradesFive,
            volumeFive,
          ] = fiveMinuteProcessing(lastFive);

          db
            .get5MinLast50()
            .then((responseFive) => {
              const lastCandleFive = {
                open: openFive,
                high: highFive,
                low: lowFive,
                close: closeFive,
              };
              const sma30Five = df.sma(responseFive, 30, closeFive);
              const [rsigainFive, rsilossFive, rsiFive] = df.rsi(
                responseFive,
                config.rsi,
                lastCandleFive,
              );

              const [mema12Five, mema26Five, msignalFive, macdFive] = df.macd(
                responseFive,
                config.macd.line1,
                config.macd.line2,
                config.macd.signal,
                lastCandleFive,
              );

              const fiveArgs = {
                nixtime,
                openFive,
                highFive,
                lowFive,
                closeFive,
                tradesFive,
                volumeFive,
                sma30Five,
                rsiFive,
                rsigainFive,
                rsilossFive,
                mema12Five,
                mema26Five,
                msignalFive,
                macdFive,
              };
              // insert data
              db.insert5min(fiveArgs).catch(console.error);
            })
            .catch(console.error);
        }
      }
    })
    .catch(console.error);
};

exports.DeltaRecord = new DeltaRecord();
