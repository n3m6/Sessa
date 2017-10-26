const bconfig = require('./bconfig.js');
const utils = require('../utils.js');
const trade = require('./backtesttrade.js');

// STRATEGY 4: Double EMA Crossover
// Take long or shot depending on whether two fast moving EMAs crossover

function enter(curr) {
  const { ema1, ema2 } = curr;
  if (ema1 > ema2) return [true, 'LONG'];
  if (ema2 > ema1) return [true, 'SHORT'];
  return [false, ''];
}

function exit(curr, orderType) {
  const { ema1, ema2 } = curr;

  if (orderType === 'LONG') {
    if (ema2 > ema1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (ema1 > ema2) return true;
    return false;
  }
  return false;
}

function doubleEMA(response, ema1, ema2, b) {
  const args = {
    ema1,
    ema2,
  };
  const [balance, drawdown] = trade.trade(response, b, enter, exit, args);
  return [balance, drawdown];
}

function main(response, balance) {
  console.log('============================================================');
  console.log('Strategy 4: Double EMA Crossover');
  console.log('enter/exit when two fast moving emas crossover');
  console.log('\n');
  console.log(`Starting Balance: ${balance}\n`);
  /*
  const ema1 = 30;
  const ema2 = 95;

  const [balanceLeft, maxDrawdown] = trade.doubleEMA(response, ema1, ema2, balance);
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
    process.stdout.write(`EMA${i}`);
    for (let j = 5; j < 101; j += 5) {
      if (i < j) {
        // only process if the fast moving average is less than slower
        const ema1 = i;
        const ema2 = j;

        let bal = 0;
        let draw = 0;

        const { norm } = bconfig;
        for (let k = 0; k < norm; k += 1) {
          const [tmpBalance, tmpDrawdown] = doubleEMA(response, ema1, ema2, balance);
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
