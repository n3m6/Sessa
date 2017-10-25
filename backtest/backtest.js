const db = require('./backtestdb.js').BacktestDB;

const dma = require('./doublema.js');
const don = require('./donchian.js');
const donm = require('./donchianmid.js');
const dodon = require('./doubledonchian.js');
const dema = require('./doubleema.js');
const demaf = require('./doubleemafingertap.js');
const dmaf = require('./doublemafingertap.js');
const mp = require('./movingaverageprice.js');

/*
To run: node backtest.js [arguments]
*/

function helpfile() {
  console.log(`
  To run: node backtest.js [arguments]
  Arguments:

  Strategies:
  --movingavgprice | -mp      (Moving average price crossover)
  --doublema | -dma           (Double moving average)
  --doublemafinger | -dmaf    (Double moving average fingertap)
  --doubleema | -dema         (Double exponential moving average)
  --doubleemafinger | -demaf  (Double EMA fingertap)
  --donchian | -don           (Donchian channels)
  --donchianmid | -donm       (Donchian channel mid line crossover)
  --doubledonchian | -dodon   (Double donchian channels)

  --all | -a
  Calculate results for all strategies avaialable.
  Warning: Will take a long time complete.

  General:
  --help | -h
  Get information on program command line arguments and options.

  --version | -v
  Display version information.

  `);
}

function callall(response, balance) {
  mp.main(response, balance);
  dma.main(response, balance);
  dmaf.main(response, balance);
  dema.main(response, balance);
  demaf.main(response, balance);
  don.main(response, balance);
  donm.main(response, balance);
  dodon.main(response, balance);
}

db
  .getRange15Min()
  .then((response) => {
    const balance = 100;

    for (let i = 2; i < process.argv.length; i += 1) {
      switch (process.argv[i]) {
        case '--help':
          helpfile();
          break;
        case '--movingavgprice':
          mp.main(response, balance);
          break;
        case '-mp':
          mp.main(response, balance);
          break;
        case '--doublema':
          dma.main(response, balance);
          break;
        case '-dma':
          dma.main(response, balance);
          break;
        case '--doublemafinger':
          dmaf.main(response, balance);
          break;
        case '-dmaf':
          dmaf.main(response, balance);
          break;
        case '--doubleema':
          dema.main(response, balance);
          break;
        case '-dema':
          dema.main(response, balance);
          break;
        case '--doubleemafinger':
          demaf.main(response, balance);
          break;
        case '-demaf':
          demaf.main(response, balance);
          break;
        case '--donchian':
          don.main(response, balance);
          break;
        case '-don':
          don.main(response, balance);
          break;
        case '--donchianmid':
          donm.main(response, balance);
          break;
        case '-donm':
          donm.main(response, balance);
          break;
        case '--doubledonchian':
          dodon.main(response, balance);
          break;
        case '-dodon':
          dodon.main(response, balance);
          break;
        case '-h':
          helpfile();
          break;
        case '-a':
          callall(response, balance);
          break;
        case '--all':
          callall(response, balance);
          break;
        default:
          console.log('Pass --help or -h as an argument to display help information.');
          break;
      }
    }

    if (process.argv.length < 3) {
      helpfile();
    }

    console.log('============================================================');

    console.log('\n');
    console.log('Done. Ctrl-C to stop program.');
    console.log('\n');
  })
  .catch(error => console.error(error));
