const config = require('./config');
const engine = require('./engine').Engine;
// const BitmexClient = require('bitmex-realtime-api');
const BitmexClient = require('./bitmexlib/bitmexlib.js');

const client = new BitmexClient(config.bitmexConfig);

client.on('open', () => console.log('connection opened.'));
client.on('error', () => console.log('caught error'));
client.on('close', () => console.log('connection closed.'));
client.on('initialize', () => console.log('initialized, waiting for data'));

engine.init();

// console.log('#\tTimestamp\t\t\tClose\tVolume\tMA\tRSI\tMACD');
// client.addStream('XBTUSD', 'tradeBin1m', data => engine.oneMinuteProcessing(data));
// client.addStream('XBTUSD', 'tradeBin1m', data => engine.fiveMinuteProcessing(data));

client.addStream('XBTUSD', 'tradeBin1m', data =>
  console.log(JSON.stringify(data[data.length - 1])));

// FIXME add client monitoring for order updates below, it should update redis when order changes
