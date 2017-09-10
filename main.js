const config = require('./config');
const BitmexClient = require('bitmex-realtime-api');

const client = new BitmexClient({
  testnet: true,
  apiKeyID: config.api.key,
  apiKeySecret: config.api.secret,
});

client.on('error', console.error);
client.on('open', () => console.log('connection opened.'));
client.on('close', () => console.log('connecttion closed.'));
client.on('initialize', () => console.log('initialized, waiting for data'));

console.log('Timestamp\t\t\tOpen\tHigh\tLow\tClose\tTrades\tVolume\tAlength');
client.addStream('XBTUSD', 'tradeBin1m', (data) => {
  const info = data[data.length - 1];
  console.log(`${info.timestamp}
    \t${info.open}
    \t${info.high}
    \t${info.low}
    \t${info.close}
    \t${info.trades}
    \t${info.volume}
    \t${data.length}`);
});
