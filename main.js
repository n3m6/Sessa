const financial = require('./financial').Financial;
const config = require('./config');
const BitmexClient = require('bitmex-realtime-api');

const client = new BitmexClient({
  testnet: false,
  apiKeyID: config.api.key,
  apiKeySecret: config.api.secret,
});

client.on('error', console.error);
client.on('open', () => console.log('connection opened.'));
client.on('close', () => console.log('connecttion closed.'));
client.on('initialize', () => console.log('initialized, waiting for data'));

console.log('#\tTimestamp\t\t\t\tClose\tVolume\tEMA\tMA\tRSI\tMACD');

client.addStream('XBTUSD', 'tradeBin1m', (data) => {
  const lastCandle = data[data.length - 1];

  const rsi = financial.roundTo(financial.rsi(data, 14), 2);
  const macd = financial.roundTo(financial.macd(data, 12, 26, 9), 2);
  const ema = financial.roundTo(financial.ema(data, 9), 2);
  const sma = financial.roundTo(financial.sma(data, 30), 2);

  console.log(`${data.length}\t${lastCandle.timestamp}\t\t${lastCandle.close}\t${lastCandle.volume}\t${ema}\t${sma}\t${rsi}\t${macd}`);
});
