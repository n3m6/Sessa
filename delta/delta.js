const config = require('../config');
const BitmexClient = require('../bitmexlib/bitmexlib.js');
const deltaRecord = require('./deltaRecord.js').DeltaRecord;

const client = new BitmexClient(config.bitmexConfig);

client.on('open', () => console.log('connection opened.'));
client.on('error', err => console.error('caught error', err));
client.on('close', () => console.log('connection closed.'));
client.on('initialize', () => console.log('initialized, waiting for data'));

client.addStream('XBTUSD', 'tradeBin1m', data => deltaRecord.process(data));

/* TODO

The delta server needs
1. A cleanup function/ or cron job the prevents the db from growing

all other clients will be monitoring the pubsub for delta updates

redis key name BitMEX:XBTUSD:1min:timestamp
fields:
timestamp, symbol,open, high, low, close, trades, volume, vwap,

added fields:
rsi, macd, sma20, sma30, sma50, sma100, sma200, ema9

*/
