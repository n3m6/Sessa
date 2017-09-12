const financial = require('./financial').Financial;
const config = require('./config');
const BitmexClient = require('bitmex-realtime-api');

let prevEMA = 0;

const client = new BitmexClient({
  testnet: false,
  apiKeyID: config.api.key,
  apiKeySecret: config.api.secret,
});

client.on('error', console.error);
client.on('open', () => console.log('connection opened.'));
client.on('close', () => console.log('connecttion closed.'));
client.on('initialize', () => console.log('initialized, waiting for data'));

console.log('#\tTimestamp\t\t\t\tClose\tVolume\tEMA\tMA\tRSI\tMACD\tChop');

client.addStream('XBTUSD', 'trade', (data) => {
  if (data.length === 1) {
    prevEMA = data[0].price;
  }

  const info = data[data.length - 1];

  const rsi = financial.roundTo(financial.rsi(data), 2);
  const macd = financial.roundTo(financial.macd(data, 12, 26, 9), 2);
  const ema = financial.roundTo(financial.ema(9, data, prevEMA), 2);
  const ma = financial.roundTo(financial.ma(30, data), 2);
  const chop = financial.roundTo(financial.chop(data), 2);

  prevEMA = ema;
  // console.log(JSON.stringify(data));
  console.log(`${data.length}\t${info.timestamp}\t\t${info.price}\t${info.size}\t${ema}\t${ma}\t${rsi}\t${macd}\t${chop}`);
});
