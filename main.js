const config = require('./config');
const engine = require('./engine').Engine;
const unirest = require('unirest');
const BitmexClient = require('bitmex-realtime-api');
const crypto = require('crypto');

/* const client = new BitmexClient(config.bitmexConfig);

client.on('error', console.error);
client.on('open', () => console.log('connection opened.'));
client.on('close', () => console.log('connecttion closed.'));
client.on('initialize', () => console.log('initialized, waiting for data')); */

// POST testing
/*
const verb = 'POST';
const path = '/api/v1/order';
const expires = Date.now() + 60000;
const data = {
  symbol: 'XBTUSD',
  side: 'Buy',
  orderQty: 300,
  ordType: 'Market',
  timeInForce: 'ImmediateOrCancel',
};
const postBody = JSON.stringify(data);
const signature = crypto
  .createHmac('sha256', config.api.secret)
  .update(verb + path + expires + postBody)
  .digest('hex');

const headers = {
  'content-type': 'application/json',
  Accept: 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'api-expires': expires,
  'api-key': config.api.key,
  'api-signature': signature,
};

const request = unirest.post(config.api.resthost + path);
request
  .header(headers)
  .send(postBody)
  .end((response) => {
    console.log(JSON.stringify(response));
  }); */

// GET testing
/* const url = `${config.api.resthost}/api/v1/leaderboard`;
const request = unirest.get(url);
const headers = {
  'content-type': 'application/json',
  Accept: 'application/json',
};

request.header(headers).end((response) => {
  console.log(JSON.stringify(response));
}); */

// console.log('#\tTimestamp\t\t\tClose\tVolume\tMA\tRSI\tMACD\tPstn\tType');
// client.addStream('XBTUSD', 'tradeBin1m', data => engine.oneMinuteProcessing(data));

/* client.addStream('XBTUSD', 'execution', (data) => {
  console.log('execution update');
  console.log(JSON.stringify(data));
}); */

/* console.log('#\tSide\tQty\tPrice\tType\tStatus\t\tavgPrce\torderID');
client.addStream('XBTUSD', 'order', (data) => {
  const curr = data.length - 1;
  if (data.length > 0) {
    console.log(`${data.length}\t${data[curr].side}\t${data[curr].orderQty}\t${data[curr].price}\t${data[curr]
      .ordType}\t${data[curr].ordStatus}\t\t${data[curr].avgPx}\t${data[curr].orderID}`);
  }
}); */
