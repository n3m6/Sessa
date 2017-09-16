const utils = require('./utils.js');
const financial = require('./financial').Financial;
const trade = require('./trade').Trade;
const config = require('./config');
const BitmexClient = require('bitmex-realtime-api');

const client = new BitmexClient(config.bitmexConfig);
const positions = {
  XBTUSD: {
    activeTrade: false, // is there an active trade with this currency
    orderType: '', // long or short
    contracts: 0, // number of contracts bought
    value: 0, // total value of contracts in play
  },
};

client.on('error', console.error);
client.on('open', () => console.log('connection opened.'));
client.on('close', () => console.log('connecttion closed.'));
client.on('initialize', () => console.log('initialized, waiting for data'));

console.log('#\tTimestamp\t\t\tClose\tVolume\tEMA\tMA\tRSI\tMACD\tPstn\tType');

client.addStream('XBTUSD', 'tradeBin1m', (data) => {
  const lastCandle = data[data.length - 1];

  const rsi = utils.roundTo(financial.rsi(data, 14), 2);
  const macd = utils.roundTo(financial.macd(data, 12, 26, 9), 2);
  const ema = utils.roundTo(financial.ema(data, 9), 2);
  const sma = utils.roundTo(financial.sma(data, 20), 2);

  if (positions.XBTUSD.activeTrade) {
    // if there's an active trade check wither we should sell it now
    if (trade.threeGreenExit(lastCandle.close, sma, positions.XBTUSD)) {
      positions.XBTUSD.activeTrade = false;
      positions.XBTUSD.orderType = '';

      // Stop the actual transaction
      trade.stopOrder(positions.XBTUSD);
    }
  } else {
    // check whether we should enter a trade
    [positions.XBTUSD.activeTrade, positions.XBTUSD.orderType] = trade.threeGreenEnter(
      lastCandle.close,
      sma,
      macd,
      rsi,
    );
    if (positions.XBTUSD.activeTrade) {
      // if an order needs to place, place it here
      trade.placeOrder(positions.XBTUSD.orderType);
    }
  }

  console.log(`${data.length}\t${lastCandle.timestamp}\t${lastCandle.close}\t${lastCandle.volume}\t${ema}\t${sma}\t${rsi}\t${macd}\t${positions
    .XBTUSD.activeTrade}\t${positions.XBTUSD.orderType}`);
});
