const keys = require('keys.js'); // eslint-disable-line

const config = {};
const testnet = true; // change this to false when in production

// how much margin to allocate for the bot
config.margin = 25;

// only take 2% loss of the whole account, sets the stop loss at this level
config.maxLoss = 0.02; // eslint-disable-line

// Ceiling % for position taking, no more than this amount of account will be used
config.maxBetSize = 0.15;

// how much volatility we expect (twice the average true range)
config.atrmultiplier = 2;

// Type of stop loss to use, options are 'FIXED' and 'TRAIL'
config.stop = 'FIXED';

// by how much the trailing stop should move (1 = full candle, 0.5 = half candle)
config.stopTrail = 0.3;

// number of rows to skip when starting (to let the moving averages aggregate)
config.rowSkip = 16;

// value to use for simple moving averages (periods it looks back)
config.sma1 = 70;
config.sma2 = 95;

// value to use for RSI (relative strength indicator)
config.rsi = 14;

// values to use for MACD
config.macd = {};
config.macd.line1 = 12;
config.macd.line2 = 26;
config.macd.signal = 9;

// periods to use for Average True Range
config.atr = 14;

config.api = {};

if (testnet) {
  config.api.key = keys.testnet.key;
  config.api.secret = keys.testnet.secret;
  config.api.host = 'wss://testnet.bitmex.com/realtime';
  config.api.resthost = 'https://testnet.bitmex.com';
  config.bitmexConfig = {
    testnet: true,
    apiKeyID: config.api.key,
    apiKeySecret: config.api.secret,
  };
} else {
  config.api.key = keys.production.key;
  config.api.secret = keys.production.secret;
  config.api.host = 'wss://www.bitmex.com/realtime';
  config.api.resthost = 'https://www.bitmex.com';
  config.bitmexConfig = {
    testnet: false,
    apiKeyID: config.api.key,
    apiKeySecret: config.api.secret,
  };
}

// redis db
config.redis = {};
config.redis.port = 6379;
config.redis.host = 'localhost';

// program configurations
// ******* DO NOT CHANGE ******* //
config.bitMEXInstrument = 'BitMEX:XBTUSD';
config.bitmex1MinPrefix = 'BitMEX:XBTUSD:1min';
config.bitmex5MinPrefix = 'BitMEX:XBTUSD:5min';
config.bitmex15MinPrefix = 'BitMEX:XBTUSD:15min';

// number of significant digits to use in calcluations
config.significant = 2;
config.indicatorSignificant = 6;

module.exports = config;
