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

console.log('#\tTimestamp\t\t\tClose\tVolume\tEMA\tMA\tRSI\tMACD\tPosition');

client.addStream('XBTUSD', 'tradeBin1m', (data) => {
  const lastCandle = data[data.length - 1];

  const rsi = financial.roundTo(financial.rsi(data, 14), 2);
  const macd = financial.roundTo(financial.macd(data, 12, 26, 9), 2);
  const ema = financial.roundTo(financial.ema(data, 9), 2);
  const sma = financial.roundTo(financial.sma(data, 30), 2);

  if (positions.XBTUSD.activeTrade) {
    // if there's an active trade check wither we should sell it now
  } else {
    // check whether we should enter a trade
  }

  console.log(`${data.length}\t${lastCandle.timestamp}\t${lastCandle.close}\t${lastCandle.volume}\t${ema}\t${sma}\t${rsi}\t${macd}\t${positions
    .XBTUSD.activeTrade}`);
});
