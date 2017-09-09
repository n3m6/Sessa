const config = require('./config');
const bitmexClient = require('bitmex-realtime-api');

const client = new bitmexClient({
  testnet: true,
  apiKeyID: config.api.key,
  apiKeySecret: config.api.secret,
});

client.addStream('XBTUSD', 'instrument', (data, symbol, tableName) => {
  console.log(`${symbol} ${data}`);
});
