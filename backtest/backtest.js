const db = require('./backtestdb.js').BacktestDB;
const utils = require('../utils.js');
const trade = require('./backtesttrade.js');

// FIXME the simple crossover function is fucked fix it !!!!
// Also it's not accounting trade losses property during quick reversals. find out why

db
  .getRange15Min()
  .then((response) => {
    const balance = 100;

    const ma = 25;
    const atrVal = 14;
    const balanceLeft = trade.simpleCrossOver(response, ma, atrVal, balance);
    const percent = utils.roundTo((balanceLeft - balance) / balance, 4);
    console.log(`Balance: ${balance}\t${balanceLeft}\t${utils.roundTo(percent * 100, 2)}%`);

    /*
    // STRATEGY 1: Simple Single Moving Average Price Crossover
    console.log('============================================================');
    console.log('Strategy 1: Moving Average Price Crossover Strategy');
    console.log('\n');
    console.log(`Starting Balance: ${balance}\n`);

    for (let i = 5; i < 101; i += 5) {
      process.stdout.write(`MA${i} `);

      const ma = i;
      const atrVal = 14;

      // Repeat 100x to normalize data (since it includes random slippage
      // that might will skew results in minimal tests)
      let bal = 0;
      for (let j = 0; j < 100; j += 1) {
        bal += trade.simpleCrossOver(response, ma, atrVal, balance);
      }

      const balanceLeft = utils.roundTo(bal / 100, 2);
      const portion = (balanceLeft - balance) / balance;
      const percent = utils.roundTo(portion * 100, 2);
      process.stdout.write(`\t${balanceLeft}\t${percent}% `);
      process.stdout.write('\n');
    }
    console.log('============================================================');
*/

    // STRATEGY 2: Double MA Crossover

    // STRATEGY 3: Double EMA Crossover
    // Take long or shot depending on whether two fast moving EMAs crossover
    /*
    console.log('============================================================');
    console.log('Strategy 3: Double EMA Crossover');
    console.log('enter/exit when two fast moving emas crossover');
    console.log('\n');
    console.log(`Starting Balance: ${balance}\n`);
    const ema1 = 8;
    const ema2 = 35;
    const balanceLeft = utils.roundTo(trade.doubleEMA(response, ema1, ema2, balance), 2);
    const percent = utils.roundTo((balanceLeft - balance) / balance, 4);
    console.log(`Balance: ${balance}\t${balanceLeft}\t${utils.roundTo(percent * 100, 2)}%`);
    console.log('============================================================');
*/
    // STRATEGY 4: Double EMA Fingertap

    // STRATEGY 5: Donchian Channel

    // STRATEGY 6: Double Donchian Channel

    console.log('\n');
    console.log('Done. Ctrl-C to stop program.');
    console.log('\n');
  })
  .catch(error => console.error(error));
