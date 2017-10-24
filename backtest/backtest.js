const db = require('./backtestdb.js').BacktestDB;
const utils = require('../utils.js');
const trade = require('./backtesttrade.js');

// FIXME the simple crossover function is fucked fix it !!!!
// Also it's not accounting trade losses property during quick reversals. find out why

db
  .getRange15Min()
  .then((response) => {
    const balance = 100;

    // STRATEGY 1: Simple Single Moving Average Price Crossover
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

    console.log('\tBAL\tPnL\tDRAW');
    for (let i = 5; i < 101; i += 5) {
      process.stdout.write(`MA${i} `);

      const ma = i;
      const atrVal = 14;

      // Repeat 100x to normalize data (since it includes random slippage
      // that might will skew results in minimal tests)
      let bal = 0;
      let draw = 0;
      for (let j = 0; j < 100; j += 1) {
        const [tmpBalance, tmpDrawdown] = trade.simpleCrossOver(response, ma, atrVal, balance);
        bal += tmpBalance;
        draw += tmpDrawdown;
      }

      const balanceLeft = utils.roundTo(bal / 100, 2);
      const portion = (balanceLeft - balance) / balance;
      const percent = utils.roundTo(portion * 100, 2);

      const maxDrawdown = draw / 100;
      const drawdownPercent = utils.roundTo(maxDrawdown * 100, 2);

      process.stdout.write(`\t${balanceLeft}\t${percent}%\t${drawdownPercent}%`);
      process.stdout.write('\n');
    }
    console.log('============================================================');

    // STRATEGY 2: Double MA Crossover
    /*
    const ma1 = 50;
    const ma2 = 60;
    const [balanceLeft, maxDrawdown] = trade.doubleMA(response, ma1, ma2, balance);
    const percent = utils.roundTo((balanceLeft - balance) / balance, 4);

    console.log(
      `Balance: ${balance}\t${utils.roundTo(balanceLeft, 2)}\t${utils.roundTo(
        percent * 100,
        2,
      )}%  ${utils.roundTo(maxDrawdown * 100, 2)}%`,
    );
    */

    console.log('============================================================');
    console.log('Strategy 2: Double Moving Average Crossover Strategy');
    console.log('\n');
    console.log(`Starting Balance: ${balance}\n`);

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
          let draw = 0;

          for (let k = 0; k < 100; k += 1) {
            const [tmpBalance, tmpDrawdown] = trade.doubleMA(response, ma1, ma2, balance);
            bal += tmpBalance;
            draw += tmpDrawdown;
          }
          bal /= 100;
          draw /= 100;

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

    // STRATEGY 3: Double MA Fingertap
    /*
    const ma1 = 7;
    const ma2 = 35;
    const [balanceLeft, maxDrawdown] = trade.doubleMAFingertap(response, ma1, ma2, balance);
    const percent = utils.roundTo((balanceLeft - balance) / balance, 4);

    console.log(`Balance: ${balance}\t${utils.roundTo(balanceLeft, 2)}\t${utils.roundTo(
      percent * 100,
      2,
    )}%  ${utils.roundTo(maxDrawdown * 100, 2)}%`);
    */

    console.log('============================================================');
    console.log('Strategy 3: Double Moving Average Fingertap Strategy');
    console.log('\n');
    console.log(`Starting Balance: ${balance}\n`);

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
          let draw = 0;

          for (let k = 0; k < 100; k += 1) {
            const [tmpBalance, tmpDrawdown] = trade.doubleMAFingertap(response, ma1, ma2, balance);
            bal += tmpBalance;
            draw += tmpDrawdown;
          }
          bal /= 100;
          draw /= 100;

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

    // STRATEGY 4: Double EMA Crossover
    // Take long or shot depending on whether two fast moving EMAs crossover

    console.log('============================================================');
    console.log('Strategy 4: Double EMA Crossover');
    console.log('enter/exit when two fast moving emas crossover');
    console.log('\n');
    console.log(`Starting Balance: ${balance}\n`);
    /*
    const ema1 = 8;
    const ema2 = 35;

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

          for (let k = 0; k < 100; k += 1) {
            const [tmpBalance, tmpDrawdown] = trade.doubleEMA(response, ema1, ema2, balance);
            bal += tmpBalance;
            draw += tmpDrawdown;
          }
          bal /= 100;
          draw /= 100;

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

    // STRATEGY 5: Double EMA Fingertap

    console.log('============================================================');
    console.log('Strategy 5: Double EMA Fingertap');
    console.log('enter/exit when price closes above/below two fast moving emas');
    console.log('\n');
    console.log(`Starting Balance: ${balance}\n`);
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

          for (let k = 0; k < 100; k += 1) {
            const [tmpBalance, tmpDrawdown] = trade.doubleEMA(response, ema1, ema2, balance);
            bal += tmpBalance;
            draw += tmpDrawdown;
          }
          bal /= 100;
          draw /= 100;

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

    // STRATEGY 6: Donchian Channel

    console.log('============================================================');
    console.log('Strategy 6: Donchian Channel');
    console.log('Long when closing price = high, short when closing = low');
    console.log('\n');
    console.log(`Starting Balance: ${balance}\n`);
    /*
    const dc1 = 70;

    const [balanceLeft, maxDrawdown] = trade.donchian(response, dc1, balance);
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
      for (let j = 0; j < 100; j += 1) {
        const [tmpBalance, tmpDrawdown] = trade.donchian(response, dc1, balance);
        bal += tmpBalance;
        draw += tmpDrawdown;
      }

      const balanceLeft = utils.roundTo(bal / 100, 2);
      const portion = (balanceLeft - balance) / balance;
      const percent = utils.roundTo(portion * 100, 2);

      const maxDrawdown = draw / 100;
      const drawdownPercent = utils.roundTo(maxDrawdown * 100, 2);

      process.stdout.write(`\t${balanceLeft}\t${percent}%\t${drawdownPercent}%`);
      process.stdout.write('\n');
    }

    console.log('============================================================');

    // STRATEGY 7: Donchian Channel Mid Crossover

    console.log('============================================================');
    console.log('Strategy 7: Donchian Channel Mid Crossover');
    console.log('Long when closing price = high, short when closing = low');
    console.log('Close positions when they cross the mid line');
    console.log('\n');
    console.log(`Starting Balance: ${balance}\n`);

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
      for (let j = 0; j < 100; j += 1) {
        const [tmpBalance, tmpDrawdown] = trade.donchianMid(response, dc1, balance);
        bal += tmpBalance;
        draw += tmpDrawdown;
      }

      const balanceLeft = utils.roundTo(bal / 100, 2);
      const portion = (balanceLeft - balance) / balance;
      const percent = utils.roundTo(portion * 100, 2);

      const maxDrawdown = draw / 100;
      const drawdownPercent = utils.roundTo(maxDrawdown * 100, 2);

      process.stdout.write(`\t${balanceLeft}\t${percent}%\t${drawdownPercent}%`);
      process.stdout.write('\n');
    }

    console.log('============================================================');

    // STRATEGY 8: Double Donchian Channel

    console.log('============================================================');
    console.log('Strategy 8: Double Donchian Channel');
    console.log('enter long/short when high/low crosses greater channel');
    console.log('exit long/short when high/low crosses smaller channel');
    console.log('\n');
    console.log(`Starting Balance: ${balance}\n`);

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

          for (let k = 0; k < 100; k += 1) {
            const [tmpBalance, tmpDrawdown] = trade.doubleDonchian(response, dc1, dc2, balance);
            bal += tmpBalance;
            draw += tmpDrawdown;
          }
          bal /= 100;
          draw /= 100;

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

    console.log('\n');
    console.log('Done. Ctrl-C to stop program.');
    console.log('\n');
  })
  .catch(error => console.error(error));
