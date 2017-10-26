const bconfig = require('./bconfig.js');
const utils = require('../utils.js');
const trade = require('./backtesttrade.js');

// STRATEGY 1: Simple Single Moving Average Price Crossover

function enter(curr) {
  const { open, close, ma1 } = curr;
  if (open > ma1 && close < ma1) return [true, 'SHORT'];
  if (open < ma1 && close > ma1) return [true, 'LONG'];
  return [false, ''];
}

function exit(curr, orderType) {
  const { open, close, ma1 } = curr;
  if (orderType === 'LONG') {
    if (open > ma1 && close < ma1) return true;
    return false;
  }
  if (orderType === 'SHORT') {
    if (open < ma1 && close > ma1) return true;
    return false;
  }
  return false;
}

function simpleCrossOver(response, ma, atrVal, b) {
  const args = {
    ma1: ma,
    atr: atrVal,
  };
  const [balance, drawdown] = trade.trade(response, b, enter, exit, args);
  return [balance, drawdown];
}

function main(response, balance) {
  /*
const ma = 25;
const atrVal = 14;
const [balanceLeft, maxDrawdown] = trade.simpleCrossOver(response, ma, atrVal, balance);
const percent = utils.roundTo((balanceLeft - balance) / balance, 4);
console.log(`Balance: ${balance}\t${balanceLeft}\t${utils.roundTo(percent * 100, 2)}%`);
*/

  console.log('============================================================');
  console.log('Strategy 1: Moving Average Price Crossover Strategy');
  console.log('\n');
  console.log(`Starting Balance: ${balance}\n`);
  console.log(`Normalization runs: ${bconfig.norm}`);
  console.log(`Stop Loss Type: ${bconfig.stop}`);
  console.log('\n');

  console.log('\tBAL\tPnL\tDRAW');
  for (let i = 5; i < 101; i += 5) {
    process.stdout.write(`MA${i} `);

    const ma = i;
    const atrVal = 14;

    // Repeat 100x to normalize data (since it includes random slippage
    // that might will skew results in minimal tests)
    let bal = 0;
    let draw = 0;
    const { norm } = bconfig;
    for (let j = 0; j < norm; j += 1) {
      const [tmpBalance, tmpDrawdown] = simpleCrossOver(response, ma, atrVal, balance);
      bal += tmpBalance;
      draw += tmpDrawdown;
    }

    const balanceLeft = utils.roundTo(bal / norm, 2);
    const portion = (balanceLeft - balance) / balance;
    const percent = utils.roundTo(portion * 100, 2);

    const maxDrawdown = draw / norm;
    const drawdownPercent = utils.roundTo(maxDrawdown * 100, 2);

    process.stdout.write(`\t${balanceLeft}\t${percent}%\t${drawdownPercent}%`);
    process.stdout.write('\n');
  }
  console.log('============================================================');
}

module.exports = { main };
