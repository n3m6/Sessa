const redis = require('redis');
const config = require('./config');
const engine = require('./engine').Engine;
const BitmexClient = require('./bitmexlib/bitmexlib.js');
const omonitor = require('./ordermon.js').OrderMonitor;
const pmonitor = require('./positionmon.js').PositionMonitor;

const { port, host } = config.redis;
const pubsub = redis.createClient(port, host, { no_ready_check: true });

const pubsubOneMin = `${config.bitmex1MinPrefix}:pubsub`;
const pubsubFiveMin = `${config.bitmex5MinPrefix}:pubsub`;
const pubsubFifteenMin = `${config.bitmex15MinPrefix}:pubsub`;

const TimeEnum = {
  ONE: 1,
  FIVE: 5,
  FIFTEEN: 15,
};

const timeframe = TimeEnum.ONE; // Change this to change strategy;

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
  console.error(`DB Error. Is DB available? ${err}`);
  throw err;
});

engine.init();

/*
three pubsubs exist right now, 1 min pubsub, 5 min pubsub & 15 min pubsub
*/

switch (timeframe) {
  case TimeEnum.ONE:
    pubsub.subscribe(pubsubOneMin);
    pubsub.on('message', (channel, message) => {
      engine.oneMinuteProcessing(message);
    });
    break;
  case TimeEnum.FIVE:
    pubsub.subscribe(pubsubFiveMin);
    pubsub.on('message', (channel, message) => {
      engine.fiveMinuteProcessing(message);
    });
    break;
  case TimeEnum.FIFTEEN:
    pubsub.subscribe(pubsubFifteenMin);
    pubsub.on('message', (channel, message) => {
      engine.fifteenMinuteProcessing(message);
    });
    break;
  default:
    throw console.error('No strategy time frame defined');
}

// Order Monitoring (will trigger stop losses, remove liquidated orders etc)
client.addStream('XBTUSD', 'order', data => omonitor.monitor(data));
client.addStream('XBTUSD', 'position', data => pmonitor.monitor(data));
