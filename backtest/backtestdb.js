const config = require('../config');
const client = require('../dbconnection');
// const utils = require('../utils');

const bitmex1MinPrefix = config.bitmex1MinPrefix; // eslint-disable-line
const bitmex5MinPrefix = config.bitmex5MinPrefix; // eslint-disable-line
const bitmex15MinPrefix = config.bitmex15MinPrefix; // eslint-disable-line

client.on('error', (err) => {
  console.error(`DB Error. Is DB available? ${err}`);
  throw err;
});

const BacktestDB = function BacktestDB() {};

function getMinBins(bin, neg, pos) {
  const args = [bin, neg, pos];

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line
    client.zrangebyscore(args, (zerr, zresponse) => {
      if (zerr) return reject(zerr);
      const result = [];
      (function getHashes() {
        const record = zresponse.splice(0, 1)[0];

        // eslint-disable-next-line
        client.hgetall(`${bin}:${record}`, (err, response) => {
          if (err) return reject(err);
          if (zresponse.length === 0) {
            result.push(response);
            return resolve(result);
          }
          result.push(response);
          setTimeout(getHashes, 0);
          // async iteration, using this instead of tail recursion to prevent stack blowout
        });
      }());
    });
  });
}

BacktestDB.prototype.getRange1Min = function getRange1Min() {
  return new Promise((resolve, reject) => {
    getMinBins(bitmex1MinPrefix, '-inf', '+inf')
      .then(reply => resolve(reply))
      .catch(error => reject(error));
  });
};

BacktestDB.prototype.getRange5Min = function getRange1Min() {
  return new Promise((resolve, reject) => {
    getMinBins(bitmex5MinPrefix, '-inf', '+inf')
      .then(reply => resolve(reply))
      .catch(error => reject(error));
  });
};

BacktestDB.prototype.getRange15Min = function getRange1Min() {
  return new Promise((resolve, reject) => {
    getMinBins(bitmex15MinPrefix, '-inf', '+inf')
      .then(reply => resolve(reply))
      .catch(error => reject(error));
  });
};

exports.BacktestDB = new BacktestDB();
