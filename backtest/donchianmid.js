const bconfig = require('./bconfig.js');
const utils = require('../utils.js');
const trade = require('./backtesttrade.js');

// STRATEGY 7: Donchian Channel Mid Crossover
function enter(curr) {
  const {
    high, low, dc1high, dc1low,
  } = curr;
  if (high >= dc1high) return [true, 'LONG'];
  if (low <= dc1low) return [true, 'SHORT'];
  return [false, ''];
}

function exit(curr, orderType) {
  const {
    high, low, close, dc1high, dc1mid, dc1low,
  } = curr;
  if (orderType === 'LONG') {
    if (close < dc1mid) return true;
    if (low <= dc1low) return true;
    return false;
  }

  if (orderType === 'SHORT') {
    if (close > dc1mid) return true;
    if (high >= dc1high) return true;
    return false;
  }
  return false;
}

function donchianMid(response, dc1, b) {
  const args = {
    dc1,
  };
  const [balance, drawdown] = trade.trade(response, b, enter, exit, args);
  return [balance, drawdown];
}

function main(response, balance) {
  console.log('============================================================');
  console.log('Strategy 7: Donchian Channel Mid Crossover');
  console.log('Long when closing price = high, short when closing = low');
  console.log('Close positions when they cross the mid line');
  console.log('\n');
  console.log(`Starting Balance: ${balance}\n`);
  console.log(`Normalization runs: ${bconfig.norm}`);
  console.log(`Stop Loss Type: ${bconfig.stop}`);
  console.log('\n');

  /*
const dc1 = 20;

const [balanceLeft, maxDrawdown] = trade.donchianMid(response, dc1, balance);
const percent = utils.roundTo((balanceLeft - balance) / balance, 4);

console.log(`Balance: ${balance}\t${utils.roundTo(balanceLeft, 2)}\t${utils.roundTo(
  percent * 100,
  2,
)}%  ${utils.roundTo(maxDrawdown * 100, 2)}%`);
*/

  console.log('\tBAL\tPnL\tDRAW');
  for (let i = 5; i < 101; i += 5) {
    process.stdout.write(`MA${i} `);

    const dc1 = i;

    // Repeat 100x to normalize data (since it includes random slippage
    // that might will skew results in minimal tests)
    let bal = 0;
    let draw = 0;

    const { norm } = bconfig;
    for (let j = 0; j < norm; j += 1) {
      const [tmpBalance, tmpDrawdown] = donchianMid(response, dc1, balance);
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
