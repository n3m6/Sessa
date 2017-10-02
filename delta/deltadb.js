const config = require('../config');
const client = require('../dbconnection');
const utils = require('../utils');

/* REDIS data structure
Hash BitMEX:XBTUSD:1min:timestamp (with all the fields)
Ordered Set BitMEX:XBTUSD:1min (key 'timestamp' value 'timestamp')

use ordered set to range search by time for removal and filter functions
*/
const bitmex1MinPrefix = config.bitmex1MinPrefix; // eslint-disable-line

client.on('error', (err) => {
  console.log(`DB Error. Is DB available? ${err}`);
  throw err;
});

const DeltaDB = function DeltaDB() {};

DeltaDB.prototype.get1MinLast50 = function get1MinLast50() {
  return new Promise((resolve, reject) => {
    // FIXME
    // const endTime = new Date().getTime();
    // const startTime = endTime - 3060000; // 51*60*1000 (51 minutes in millisecs)
    const startTime = '-inf';
    const endTime = '+inf';
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

// FIXME insert a 1min bin
DeltaDB.prototype.insert1min = function insert1Min(
  timestamp,
  open,
  high,
  low,
  close,
  trades,
  volume,
  tvwap,
  sma30,
  rsi,
  rsiavggain,
  rsiavgloss,
  /* macd,
  sma50,
  sma100,
  sma200,
  ema9, */
) {
  const vwap = tvwap === null ? 'null' : utils.roundTo(tvwap, config.significant);

  return new Promise((resolve, reject) => {
    const args = [
      `${bitmex1MinPrefix}:${timestamp}`,
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
      vwap,
      'sma30',
      sma30,
      'rsi',
      rsi,
      'rsiavggain',
      rsiavggain,
      'rsiavgloss',
      rsiavgloss,
    ];
    const zargs = [`${bitmex1MinPrefix}`, `${timestamp}`, timestamp];
    const t = new Date(timestamp);
    const tTime = t.toISOString();
    console.log(`${tTime}\t${open}\t${high}\t${low}\t${close}\t${trades}\t${volume}\t${vwap}\t${sma30}\t${rsi}\t${rsiavggain}\t${rsiavgloss}`);

    // console.log(args);
    // console.log(zargs);
    // insert to hash
    // insert to ordered set, so it can queried
    // do this with a multi
    client
      .multi()
      .hmset(args)
      .zadd(zargs)
      .exec((err, replies) => {
        if (err) reject(err);
        resolve(replies);
      });
  });
};

exports.DeltaDB = new DeltaDB();
