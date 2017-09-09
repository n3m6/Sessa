const config = require('./config');
const BitmexClient = require('bitmex-realtime-api');

const client = new BitmexClient({
  testnet: true,
  apiKeyID: config.api.key,
  apiKeySecret: config.api.secret,
});

client.addStream('XBTUSD', 'instrument', (data, symbol, tableName) => {
  console.log(`${symbol} ${data} ${tableName}`);
});
