const db = require('./backtestdb.js').BacktestDB;
const utils = require('../utils.js');
const trade = require('./backtesttrade.js');

db
  .getRange15Min()
  .then((response) => {
    // STRATEGY 1: Simple Single Moving Average Price Crossover
    const balance = 100;
    /*
    const ma = 20;
    const atrVal = 14;
    const balanceLeft = utils.roundTo(simpleCrossOver(response, ma, atrVal, balance), 2);
    const percent = utils.roundTo((balanceLeft - balance) / balance, 4);
    console.log(`Balance: ${balance}\t${balanceLeft}\t${utils.roundTo(percent * 100, 2)}%`);
*/

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

      const balanceLeft = bal / 100;
      const portion = (balanceLeft - balance) / balance;
      const percent = utils.roundTo(portion * 100, 2);
      process.stdout.write(`\t${percent}% `);
      process.stdout.write('\n');
    }

    console.log('\n');
    console.log('Done. Ctrl-C to stop program.');
    console.log('\n');
  })
  .catch(error => console.error(error));
