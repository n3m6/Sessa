const config = require('../config');
const hftengine = require('./engine.js');
const BitmexClient = require('../bitmexlib/bitmexlib.js');

const client = new BitmexClient(config.bitmexConfig);

client.on('open', () => console.log('connection opened.'));
client.on('error', err => console.error('caught error', err));
client.on('close', () => console.log('connection closed.'));
client.on('initialize', () => console.log('initialized, waiting for data'));

// Streaming full level 2 Order Book
client.addStream('XBTUSD', 'orderBookL2', data => hftengine.process(data));
