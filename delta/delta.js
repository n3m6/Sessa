const config = require('../config');
const BitmexClient = require('../bitmexlib/bitmexlib.js');
const deltaRecord = require('./deltaRecord.js').DeltaRecord;

const client = new BitmexClient(config.bitmexConfig);

client.on('open', () => console.log('connection opened.'));
client.on('error', err => console.log('caught error', err));
client.on('close', () => console.log('connection closed.'));
client.on('initialize', () => console.log('initialized, waiting for data'));

client.addStream('XBTUSD', 'tradeBin1m', data => deltaRecord.process(data));
// client.addStream('XBTUSD', 'trade', data => deltaRecord.process(data));
// FIXME send this data to the redis db

/* TODO

The delta server needs
1. record the data in the redis db
2. Calculate the macd, rsi, moving averages and store them in the db
3. A cleanup function/ or cron job the prevents the db from growing
4. alert the pubsub

all other clients will be monitoring the pubsub for delta updates

redis key name BitMEX:XBTUSD:1min:timestamp
fields:
timestamp, symbol,open, high, low, close, trades, volume, vwap,

added fields:
rsi, macd, sma30, sma50, sma100, sma200, ema9

*/
