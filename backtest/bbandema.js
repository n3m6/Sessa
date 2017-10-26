const bconfig = require('./bconfig.js');
const utils = require('../utils.js');
const trade = require('./backtesttrade.js');

// STRATEGY 10: Bollinger Bands with EMA (Mean reversion towards trend)

function enter(curr) {
  const {
    high, low, bband1high, bband1low, ema1, ema2,
  } = curr;

  // Mean reversion in the direction of the trend
  // Take a long when price crosses lower band and emas show trending higher
  // Take a short when price crosses higher band and emas show trending lower

  if (ema1 > ema2 && low <= bband1low) return [true, 'LONG'];
  if (ema2 > ema1 && high >= bband1high) return [true, 'SHORT'];
  return [false, ''];
}

function exit(curr, orderType) {
  const {
    high, low, bband1high, bband1low,
  } = curr;
  if (orderType === 'LONG') {
    if (high >= bband1high) return true;
    return false;
  }

  if (orderType === 'SHORT') {
    if (low <= bband1low) return true;
    return false;
  }
  return false;
}

function bollinger(response, bband1, bband1dev, ema1, ema2, b) {
  const args = {
    bband1,
    bband1dev,
    ema1,
    ema2,
  };
  const [balance, drawdown] = trade.trade(response, b, enter, exit, args);
  return [balance, drawdown];
}

function main(response, balance) {
  console.log('============================================================');
  console.log('Strategy 10: Bollinger Bands with EMA (Mean reversion towards trend)');
  console.log('Long when low < low band and ema trends higher');
  console.log('Short when high > high and and ema trends lower');
  console.log('\n');
  console.log(`Starting Balance: ${balance}\n`);
  /*
  const bband1 = 20;
  const bband1dev = 2;
  const ema1 = 30;
  const ema2 = 90;

  const [balanceLeft, maxDrawdown] = bollinger(response, bband1, bband1dev, ema1, ema2, balance);
  const percent = utils.roundTo((balanceLeft - balance) / balance, 4);

  console.log(`Balance: ${balance}\t${utils.roundTo(balanceLeft, 2)}\t${utils.roundTo(
    percent * 100,
    2,
  )}%  ${utils.roundTo(maxDrawdown * 100, 2)}%`);
  */

  console.log('\tBAL\tPnL\tDRAW');
  for (let i = 5; i < 101; i += 5) {
    process.stdout.write(`MA${i} `);

    const bband1 = i;
    const bband1dev = 2;
    const ema1 = 30;
    const ema2 = 90;

    // Repeat 100x to normalize data (since it includes random slippage
    // that might will skew results in minimal tests)
    let bal = 0;
    let draw = 0;

    const { norm } = bconfig;
    for (let j = 0; j < norm; j += 1) {
      const [tmpBalance, tmpDrawdown] = bollinger(response, bband1, bband1dev, ema1, ema2, balance);
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
