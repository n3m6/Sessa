const config = require('../config');
const client = require('../dbconnection');
const utils = require('../utils');

/* REDIS data structure
Hash BitMEX:XBTUSD:1min:timestamp (with all the fields)
Ordered Set BitMEX:XBTUSD:1min (key 'timestamp' value 'timestamp')

use ordered set to range search by time for removal and filter functions
*/
const bitmex1MinPrefix = config.bitmex1MinPrefix; // eslint-disable-line
const bitmex5MinPrefix = config.bitmex5MinPrefix; // eslint-disable-line

client.on('error', (err) => {
  console.log(`DB Error. Is DB available? ${err}`);
  throw err;
});

const DeltaDB = function DeltaDB() {};

DeltaDB.prototype.get1MinLast50 = function get1MinLast50() {
  return new Promise((resolve, reject) => {
    // FIXME
    const endTime = new Date().getTime();
    const startTime = endTime - 3060000; // 51*60*1000 (51 minutes in millisecs)
    // const startTime = '-inf';
    // const endTime = '+inf';
    const args = [bitmex1MinPrefix, startTime, endTime];
    // console.log(args);

    // eslint-disable-next-line
    client.zrangebyscore(args, (zerr, zresponse) => {
      if (zerr) return reject(zerr);
      // return resolve(response);
      // console.log(zresponse);
      const result = [];
      (function get1MinHashes() {
        const record = zresponse.splice(0, 1)[0];
        // console.log(record);

        // eslint-disable-next-line
        client.hgetall(`${bitmex1MinPrefix}:${record}`, (err, response) => {
          if (err) return reject(err);
          if (zresponse.length === 0) {
            result.push(response);
            return resolve(result);
          }
          result.push(response);
          setTimeout(get1MinHashes, 0);
          // async iteration, using this instead of tail recursion to prevent stack blowout
        });
      }());
    });
  });
};

DeltaDB.prototype.get5MinLast50 = function get5MinLast50() {
  return new Promise((resolve, reject) => {
    // FIXME
    const endTime = new Date().getTime();
    const startTime = endTime - 15300000; // 51*5*60*1000 (255 minutes in millisecs)
    // const startTime = '-inf';
    // const endTime = '+inf';
    const args = [bitmex5MinPrefix, startTime, endTime];
    // console.log(args);

    // eslint-disable-next-line
    client.zrangebyscore(args, (zerr, zresponse) => {
      if (zerr) return reject(zerr);
      // return resolve(response);
      // console.log(zresponse);
      const result = [];
      (function get5MinHashes() {
        const record = zresponse.splice(0, 1)[0];
        // console.log(record);

        // eslint-disable-next-line
        client.hgetall(`${bitmex5MinPrefix}:${record}`, (err, response) => {
          if (err) return reject(err);
          if (zresponse.length === 0) {
            result.push(response);
            return resolve(result);
          }
          result.push(response);
          setTimeout(get5MinHashes, 0);
          // async iteration, using this instead of tail recursion to prevent stack blowout
        });
      }());
    });
  });
};

DeltaDB.prototype.insert1min = function insert1Min(args) {
  return new Promise((resolve, reject) => {
    const {
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
    } = args;

    /* sma50,
  sma100,
  sma200,
  ema9, */
    const timestamp = nixtime;
    const tvwap = vwap === null ? 'null' : utils.roundTo(vwap, config.significant);

    const inargs = [
      `${bitmex1MinPrefix}:${timestamp}`,
      'timestamp',
      timestamp,
      'open',
      open,
      'high',
      high,
      'low',
      low,
      'close',
      close,
      'trades',
      trades,
      'volume',
      volume,
      'vwap',
      tvwap,
      'sma30',
      sma30,
      'rsi',
      rsi,
      'rsiavggain',
      rsiavggain,
      'rsiavgloss',
      rsiavgloss,
      'mema12',
      mema12,
      'mema26',
      mema26,
      'msignal',
      msignal,
      'macd',
      macd,
    ];
    const zargs = [`${bitmex1MinPrefix}`, `${timestamp}`, timestamp];
    const t = new Date(timestamp);
    const tTime = t.toISOString();
    console.log(`${tTime}\t${open}\t${high}\t${low}\t${close}\t${trades}\t${volume}\t${tvwap}\t${sma30}\t${rsi}\t${rsiavggain}\t${rsiavgloss}\t${mema12}\t${mema26}\t${msignal}\t${macd}`);

    client
      .multi()
      .hmset(inargs)
      .zadd(zargs)
      .exec((err, replies) => {
        if (err) reject(err);
        resolve(replies);
      });
  });
};

DeltaDB.prototype.insert5min = function insert5min(args) {
  return new Promise((resolve, reject) => {
    const {
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
    } = args;

    const timestamp = nixtime;

    const inargs = [
      `${bitmex5MinPrefix}:${timestamp}`,
      'timestamp',
      timestamp,
      'open',
      openFive,
      'high',
      highFive,
      'low',
      lowFive,
      'close',
      closeFive,
      'trades',
      tradesFive,
      'volume',
      volumeFive,
      'sma30',
      sma30Five,
      'rsi',
      rsiFive,
      'rsiavggain',
      rsigainFive,
      'rsiavgloss',
      rsilossFive,
      'mema12',
      mema12Five,
      'mema26',
      mema26Five,
      'msignal',
      msignalFive,
      'macd',
      macdFive,
    ];
    const zargs = [`${bitmex5MinPrefix}`, `${timestamp}`, timestamp];
    const t = new Date(timestamp);
    const tTime = t.toISOString();
    console.log('----------- 5 min -----------');
    console.log(`${tTime}\t${openFive}\t${highFive}\t${lowFive}\t${closeFive}\t${tradesFive}\t${volumeFive}\t\t${sma30Five}\t${rsiFive}\t${rsigainFive}\t${rsilossFive}\t${mema12Five}\t${mema26Five}\t${msignalFive}\t${macdFive}`);
    console.log('-----------------------------');

    client
      .multi()
      .hmset(inargs)
      .zadd(zargs)
      .exec((err, replies) => {
        if (err) reject(err);
        resolve(replies);
      });
  });
};

exports.DeltaDB = new DeltaDB();
