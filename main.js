const redis = require('redis');
const config = require('./config');
const engine = require('./engine').Engine;

const { port, host } = config.redis;
const pubsub = redis.createClient(port, host, { no_ready_check: true });

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
two pubsubs exist right now, 1 minute pubsub and 5 min pubsub
use one or the other (but not both) for processing your trades
*/

const pubsubFiveMin = `${config.bitmex5MinPrefix}:pubsub`;

pubsub.subscribe(pubsubFiveMin);
pubsub.on('message', (channel, message) => {
  engine.fiveMinuteProcessing(message);
});

// FIXME add client monitoring for order updates below, it should update redis when order changes
