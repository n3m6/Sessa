const config = require('./config');
const engine = require('./engine').Engine;
const BitmexClient = require('bitmex-realtime-api');

const client = new BitmexClient(config.bitmexConfig);

client.on('error', console.error);
client.on('open', () => console.log('connection opened.'));
client.on('close', () => console.log('connecttion closed.'));
client.on('initialize', () => console.log('initialized, waiting for data'));

console.log('#\tTimestamp\t\t\tClose\tVolume\tMA\tRSI\tMACD\tPstn\tType');

client.addStream('XBTUSD', 'tradeBin1m', data => engine.oneMinuteProcessing(data));
