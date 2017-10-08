const redis = require('redis');
const config = require('./config');
const engine = require('./engine').Engine;
const BitmexClient = require('./bitmexlib/bitmexlib.js');
const omonitor = require('./ordermon.js').OrderMonitor;

const { port, host } = config.redis;
const pubsub = redis.createClient(port, host, { no_ready_check: true });

const client = new BitmexClient(config.bitmexConfig);

client.on('open', () => console.log('connection opened.'));
client.on('error', err => console.log('caught error', err));
client.on('close', () => console.log('connection closed.'));
client.on('initialize', () => console.log('initialized, waiting for data'));

/*
Main requires an active delta server that processes incoming trades
and attaches values like RSI and MACD to it.
Run delta server independently from main
*/

pubsub.on('error', (err) => {
  console.log(`DB Error. Is DB available? ${err}`);
  throw err;
});

engine.init();

/*
three pubsubs exist right now, 1 min pubsub, 5 min pubsub & 15 min pubsub
use one or the other (but not both) for processing your trades
*/

const pubsubOneMin = `${config.bitmex1MinPrefix}:pubsub`;

pubsub.subscribe(pubsubOneMin);
pubsub.on('message', (channel, message) => {
  engine.oneMinuteProcessing(message);
});

/*
const pubsubFiveMin = `${config.bitmex5MinPrefix}:pubsub`;

pubsub.subscribe(pubsubFiveMin);
pubsub.on('message', (channel, message) => {
  engine.fiveMinuteProcessing(message);
});
*/

/* const pubsubFifteenMin = `${config.bitmex15MinPrefix}:pubsub`;

pubsub.subscribe(pubsubFifteenMin);
pubsub.on('message', (channel, message) => {
  engine.fifteenMinuteProcessing(message);
});
*/

// FIXME fix bitmex library to use heartbeats to keep the connection alive
// Order Monitoring (will trigger stop losses)
client.addStream('XBTUSD', 'order', data => omonitor.monitor(data));
