const config = require('./config');
const unirest = require('unirest');
const crypto = require('crypto');

// FIXME refactor this library get rid of duplicate parts in the functions

const BitMEX = function BitMEX() {};

BitMEX.prototype.init = function init() {};

BitMEX.prototype.getBitMexBalance = function getBitMexBalance() {
  return new Promise((resolve, reject) => {
    const verb = 'GET';
    const path = '/api/v1/user/wallet';
    const expires = Date.now() + 60000;

    const signature = crypto
      .createHmac('sha256', config.api.secret)
      .update(verb + path + expires)
      .digest('hex');

    const headers = {
      'content-type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'api-expires': expires,
      'api-key': config.api.key,
      'api-signature': signature,
    };

    const request = unirest.get(config.api.resthost + path);
    request.header(headers).end((response) => {
      if (response.code === 200) return resolve(response.body.amount);
      return reject(response);
    });
  });
};

BitMEX.prototype.bitMexAdjustMargin = function bitMexAdjustMargin(margin) {
  return new Promise((resolve, reject) => {
    const verb = 'POST';
    const path = '/api/v1/position/leverage';
    const expires = Date.now() + 60000;
    const data = {
      symbol: 'XBTUSD',
      leverage: margin,
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
        if (response.code === 200) return resolve(response);
        return reject(response);
      });
  });
};

BitMEX.prototype.bitMexMarketOrder = function bitMexMarketOrder(side, orderQty) {
  return new Promise((resolve, reject) => {
    const verb = 'POST';
    const path = '/api/v1/order';
    const expires = Date.now() + 60000;
    const data = {
      symbol: 'XBTUSD',
      side,
      orderQty,
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
        if (response.code === 200) return resolve(response);
        return reject(response);
      });
  });
};

BitMEX.prototype.bitMexClosePosition = function bitMexClosePosition(orderId) {
  const verb = 'POST';
  const path = '/api/v1/order';
  const expires = Date.now() + 60000;
  const data = {
    orderID: orderId,
    symbol: 'XBTUSD',
    execInst: 'Close',
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
      if (response.code === 200) {
        // console.log(response.body);
        // return resolve(response);
        // FIXME this could be better
        console.log('position closed');
      } else {
        console.log('position could not be closed');
      }
      // console.log(`error: ${JSON.stringify(response.body)}`);
      // return reject(response);
    });
};

// FIXME test stop loss function (haven't been tested yet)
BitMEX.prototype.bitMexSetStopLoss = function bitMexSetStopLoss(orderId, stopPrice) {
  const verb = 'POST';
  const path = '/api/v1/order';
  const expires = Date.now() + 60000;
  const data = {
    orderID: orderId,
    symbol: 'XBTUSD',
    ordType: 'Stop',
    stopPx: stopPrice,
    execInst: 'Close, LastPrice',
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
      if (response.code === 200) {
        // console.log(response.body);
        // return resolve(response);
        // FIXME this could be better
        console.log('stop loss set');
      } else {
        console.log(`could not set stop loss for position${JSON.stringify(response)}`);
      }
      // console.log(`error: ${JSON.stringify(response.body)}`);
      // return reject(response);
    });
};

exports.BitMEX = new BitMEX();
