const bconfig = require('./bconfig.js');
const utils = require('../utils.js');
const trade = require('./backtesttrade.js');

// STRATEGY 5: Double EMA Fingertap
function enter(trades) {
  const curr = trades[trades.length - 1];
  const { close, ema1, ema2 } = curr;
  if (ema1 > ema2 && close > ema1) return [true, 'LONG'];
  if (ema2 > ema1 && close < ema1) return [true, 'SHORT'];
  return [false, ''];
}

function exit(trades, orderType) {
  const curr = trades[trades.length - 1];
  const { close, ema1, ema2 } = curr;

  if (orderType === 'LONG') {
    if (ema2 > ema1) return true;
    if (ema1 > ema2 && close < ema1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (ema1 > ema2) return true;
    if (ema2 > ema1 && close > ema1) return true;
    return false;
  }

  return false;
}

function doubleEMAFingertap(response, ema1, ema2, b) {
  const args = {
    ema1,
    ema2,
  };
  const [balance, drawdown] = trade.trade(response, b, enter, exit, args);
  return [balance, drawdown];
}

function main(response, balance) {
  console.log('============================================================');
  console.log('Strategy 5: Double EMA Fingertap');
  console.log('enter/exit when price closes above/below two fast moving emas');
  console.log('\n');
  console.log(`Starting Balance: ${balance}\n`);
  console.log(`Normalization runs: ${bconfig.norm}`);
  console.log(`Stop Loss Type: ${bconfig.stop}`);
  console.log('\n');
  /*
const ema1 = 7;
const ema2 = 30;

const [balanceLeft, maxDrawdown] = trade.doubleEMAFingertap(response, ema1, ema2, balance);
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
          const [tmpBalance, tmpDrawdown] = doubleEMAFingertap(response, ema1, ema2, balance);
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
