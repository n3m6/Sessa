const bconfig = require('./bconfig.js');
const utils = require('../utils.js');
const trade = require('./backtesttrade.js');

// STRATEGY 8: Double Donchian Channel

function enter(curr) {
  const {
    high, low, dc2high, dc2low,
  } = curr;
  if (high >= dc2high) return [true, 'LONG'];
  if (low <= dc2low) return [true, 'SHORT'];
  return [false, ''];
}

function exit(curr, orderType) {
  const {
    high, low, dc1high, dc1low,
  } = curr;
  if (orderType === 'LONG') {
    if (low <= dc1low) return true;
    return false;
  }

  if (orderType === 'SHORT') {
    if (high >= dc1high) return true;
    return false;
  }
  return false;
}

function doubleDonchian(response, dc1, dc2, b) {
  const args = {
    dc1,
    dc2,
  };
  const [balance, drawdown] = trade.trade(response, b, enter, exit, args);
  return [balance, drawdown];
}

function main(response, balance) {
  console.log('============================================================');
  console.log('Strategy 8: Double Donchian Channel');
  console.log('enter long/short when high/low crosses greater channel');
  console.log('exit long/short when high/low crosses smaller channel');
  console.log('\n');
  console.log(`Starting Balance: ${balance}\n`);
  console.log(`Normalization runs: ${bconfig.norm}`);
  console.log(`Stop Loss Type: ${bconfig.stop}`);
  console.log('\n');

  /*
const dc1 = 20;
const dc2 = 40;

const [balanceLeft, maxDrawdown] = trade.doubleDonchian(response, dc1, dc2, balance);
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
    process.stdout.write(`DC${i}`);
    for (let j = 5; j < 101; j += 5) {
      if (i < j) {
        // only process if the fast moving average is less than slower
        const dc1 = i;
        const dc2 = j;

        let bal = 0;
        let draw = 0;

        const { norm } = bconfig;
        for (let k = 0; k < norm; k += 1) {
          const [tmpBalance, tmpDrawdown] = doubleDonchian(response, dc1, dc2, balance);
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
}

module.exports = { main };
