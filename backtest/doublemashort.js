const bconfig = require('./bconfig.js');
const utils = require('../utils.js');
const trade = require('./backtesttrade.js');

// STRATEGY 2: Double MA Crossover

function enter(trades) {
  const curr = trades[trades.length - 1];
  const { ma1, ma2 } = curr;
  // if (ma1 > ma2) return [true, 'LONG'];
  if (ma2 > ma1) return [true, 'SHORT'];
  return [false, ''];
}

function exit(trades, orderType) {
  const curr = trades[trades.length - 1];
  const { ma1, ma2 } = curr;

  if (orderType === 'LONG') {
    if (ma2 > ma1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (ma1 > ma2) return true;
    return false;
  }
  return false;
}

function doubleMA(response, ma1, ma2, b) {
  const args = {
    ma1,
    ma2,
  };
  const [balance, drawdown] = trade.trade(response, b, enter, exit, args);
  return [balance, drawdown];
}

function main(response, balance) {
  console.log('============================================================');
  console.log('Strategy 14: Double Moving Average Crossover SHORT Only Strategy');
  console.log('\n');
  console.log(`Starting Balance: ${balance}\n`);
  console.log(`Normalization runs: ${bconfig.norm}`);
  console.log(`Stop Loss Type: ${bconfig.stop}`);
  console.log('\n');
  /*
  const ma1 = 50;
  const ma2 = 60;
  const [balanceLeft, maxDrawdown] = doubleMA(response, ma1, ma2, balance);
  console.log(maxDrawdown);
  const percent = utils.roundTo((balanceLeft - balance) / balance, 4);

  console.log(`Balance: ${balance}\t${utils.roundTo(balanceLeft, 2)}\t${utils.roundTo(
    percent * 100,
    2,
  )}%  ${utils.roundTo(maxDrawdown * 100, 2)}%`);
  */

  for (let j = 5; j < 101; j += 5) {
    process.stdout.write(`\t${j}`);
  }
  process.stdout.write('\n');

  for (let i = 5; i < 101; i += 5) {
    process.stdout.write(`MA${i}`);
    for (let j = 5; j < 101; j += 5) {
      if (i < j) {
        // only process if the fast moving average is less than slower
        const ma1 = i;
        const ma2 = j;

        let bal = 0;
        let draw = 0; // eslint-disable-line

        const { norm } = bconfig;
        for (let k = 0; k < norm; k += 1) {
          const [tmpBalance, tmpDrawdown] = doubleMA(response, ma1, ma2, balance);
          bal += tmpBalance;
          draw += tmpDrawdown;
        }
        bal /= norm;
        draw /= norm;

        let percent = (bal - balance) / balance;
        percent *= 100;

        process.stdout.write(`\t${utils.roundTo(percent, 2)}%`);
      } else {
        process.stdout.write('\t ');
      }
    }
    process.stdout.write('\n');
  }

  console.log('============================================================');
}

module.exports = { main };
