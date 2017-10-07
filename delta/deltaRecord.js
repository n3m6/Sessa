const config = require('../config');
const db = require('./deltadb.js').DeltaDB;
const df = require('./deltaFinancial.js').DeltaFinancial;
const utils = require('../utils');

const DeltaRecord = function DeltaRecord() {
  console.log('TIME\t\t\t\tOPEN\tHIGH\tLOW\tCLOSE\tTRADES\tVOL\tSMA30\tRSI\tMACD');
};

const bitmex1MinPrefix = config.bitmex1MinPrefix; // eslint-disable-line

function getHigh(data) {
  let high = 0.001;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] !== null) high = data[i].high > high ? data[i].high : high;
  }
  return high;
}

function getLow(data) {
  let low = Number.MAX_SAFE_INTEGER; // eslint-disable-line
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] !== null) low = data[i].low < low ? data[i].low : low;
  }
  return low;
}

function getTrades(data) {
  let trades = 0;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] !== null) trades += parseInt(data[i].trades, 10);
  }
  return trades;
}

function getVolume(data) {
  let volume = 0;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] !== null) volume += parseInt(data[i].volume, 10);
  }
  return volume;
}

function fiveMinuteProcessing(lastFive) {
  const openFive = lastFive[0] === null ? lastFive[1].open : lastFive[0].open;
  // first element is null when we start on the exact 5 min mark
  const highFive = getHigh(lastFive);
  const lowFive = getLow(lastFive);
  const closeFive = lastFive[lastFive.length - 1].close;
  const tradesFive = getTrades(lastFive);
  const volumeFive = getVolume(lastFive);
  return [openFive, highFive, lowFive, closeFive, tradesFive, volumeFive];
}

function fifteenMinuteProcessing(lastFifteen) {
  const openFifteen = lastFifteen[0] === null ? lastFifteen[1].open : lastFifteen[0].open;
  // first element is null when we start on the exact 5 min mark
  const highFifteen = getHigh(lastFifteen);
  const lowFifteen = getLow(lastFifteen);
  const closeFifteen = lastFifteen[lastFifteen.length - 1].close;
  const tradesFifteen = getTrades(lastFifteen);
  const volumeFifteen = getVolume(lastFifteen);
  return [openFifteen, highFifteen, lowFifteen, closeFifteen, tradesFifteen, volumeFifteen];
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

        // Processing trades in 15 min bins
        if (jsDate.getMinutes() % 15 === 0) {
          const lastFifteen = utils.arraySlice(14, response);

          lastFifteen.push(args);

          const [
            openFifteen,
            highFifteen,
            lowFifteen,
            closeFifteen,
            tradesFifteen,
            volumeFifteen,
          ] = fifteenMinuteProcessing(lastFifteen);

          db
            .get15MinLast50()
            .then((responseFifteen) => {
              const lastCandleFifteen = {
                open: openFifteen,
                high: highFifteen,
                low: lowFifteen,
                close: closeFifteen,
              };
              const sma30Fifteen = df.sma(responseFifteen, 30, closeFifteen);
              const [rsigainFifteen, rsilossFifteen, rsiFifteen] = df.rsi(
                responseFifteen,
                config.rsi,
                lastCandleFifteen,
              );

              const [mema12Fifteen, mema26Fifteen, msignalFifteen, macdFifteen] = df.macd(
                responseFifteen,
                config.macd.line1,
                config.macd.line2,
                config.macd.signal,
                lastCandleFifteen,
              );

              const fifteenArgs = {
                nixtime,
                openFifteen,
                highFifteen,
                lowFifteen,
                closeFifteen,
                tradesFifteen,
                volumeFifteen,
                sma30Fifteen,
                rsiFifteen,
                rsigainFifteen,
                rsilossFifteen,
                mema12Fifteen,
                mema26Fifteen,
                msignalFifteen,
                macdFifteen,
              };
              // insert data
              db.insert15min(fifteenArgs).catch(console.error);
            })
            .catch(console.error);
        }
      }
    })
    .catch(console.error);
};

exports.DeltaRecord = new DeltaRecord();
