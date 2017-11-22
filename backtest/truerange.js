const bconfig = require('./bconfig.js');
const utils = require('../utils.js');
const trade = require('./backtesttrade.js');

// STRATEGY 12: Detect trend with True Range
// based on ChopBot 1.0 by yerb (from tradingview)

function enter(trades) {
  const curr = trades[trades.length - 1];
  const prev = trades[trades.length - 2];
  const {
    open, close, high, low,
  } = curr;
  const prevclose = prev.close;
  const prevtr = prev.tr;
  const up = prevclose + prevtr;
  const down = prevclose - prevtr;
  if (high > up && close > open) return [true, 'LONG'];
  if (low < down && close < open) return [true, 'SHORT'];
  return [false, ''];
}

function exit(trades, orderType) {
  const curr = trades[trades.length - 1];
  const prev = trades[trades.length - 2];
  const {
    open, close, high, low,
  } = curr;
  const prevclose = prev.close;
  const prevtr = prev.tr;
  const up = prevclose + prevtr;
  const down = prevclose - prevtr;
  if (orderType === 'LONG') {
    if (low < down && close < open) return true;
    return false;
  }

  if (orderType === 'SHORT') {
    if (high > up && close > open) return true;
    return false;
  }
  return false;
}

function truerange(response, trmulti, b) {
  const args = {
    trmulti,
  };
  const [balance, drawdown] = trade.trade(response, b, enter, exit, args);
  return [balance, drawdown];
}

function main(response, balance) {
  console.log('============================================================');
  console.log('Strategy 12: Trade Trends with True Range');
  console.log('Short when low is lower than prev close - prev true range');
  console.log('Long when high is higher than prev close + prev true range');
  console.log('\n');
  console.log(`Starting Balance: ${balance}\n`);

  console.log(`Normalization runs: ${bconfig.norm}`);
  console.log(`Stop Loss Type: ${bconfig.stop}`);
  console.log('\n');
  /*
  const trmulti = 1;

  const [balanceLeft, maxDrawdown] = truerange(response, trmulti, balance);
  const percent = utils.roundTo((balanceLeft - balance) / balance, 4);

  console.log(`Balance: ${balance}\t${utils.roundTo(balanceLeft, 2)}\t${utils.roundTo(
    percent * 100,
    2,
  )}%  ${utils.roundTo(maxDrawdown * 100, 2)}%`);
  */

  console.log('\tBAL\tPnL\tDRAW');
  for (let i = 1; i < 10; i += 1) {
    process.stdout.write(`MA${i} `);

    const trmulti = i;

    // Repeat 100x to normalize data (since it includes random slippage
    // that might will skew results in minimal tests)
    let bal = 0;
    let draw = 0;

    const { norm } = bconfig;
    for (let j = 0; j < norm; j += 1) {
      const [tmpBalance, tmpDrawdown] = truerange(response, trmulti, balance);
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
