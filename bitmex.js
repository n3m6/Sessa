const config = require('./config');
const unirest = require('unirest');
const crypto = require('crypto');

function bmHeaders(verb, path, postBody) {
  const expires = Date.now() + 60000;
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
  return headers;
}

const BitMEX = function BitMEX() {};

BitMEX.prototype.init = function init() {};

BitMEX.prototype.getBalance = function getBalance() {
  return new Promise((resolve, reject) => {
    const verb = 'GET';
    const path = '/api/v1/user/wallet';
    const headers = bmHeaders(verb, path, '');

    const request = unirest.get(config.api.resthost + path);
    request.header(headers).end((response) => {
      if (response.code === 200) return resolve(response.body.amount);
      return reject(response);
    });
  });
};

BitMEX.prototype.adjustMargin = function adjustMargin(margin) {
  return new Promise((resolve, reject) => {
    const verb = 'POST';
    const path = '/api/v1/position/leverage';
    const data = {
      symbol: 'XBTUSD',
      leverage: margin,
    };
    const postBody = JSON.stringify(data);
    const headers = bmHeaders(verb, path, postBody);

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

BitMEX.prototype.marketOrder = function marketOrder(side, orderQty) {
  return new Promise((resolve, reject) => {
    const verb = 'POST';
    const path = '/api/v1/order';
    const data = {
      symbol: 'XBTUSD',
      side,
      orderQty,
      ordType: 'Market',
      timeInForce: 'ImmediateOrCancel',
    };
    const postBody = JSON.stringify(data);
    const headers = bmHeaders(verb, path, postBody);

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

BitMEX.prototype.closePosition = function closePosition(orderId) {
  return new Promise((resolve, reject) => {
    const verb = 'POST';
    const path = '/api/v1/order';
    const data = {
      orderID: orderId,
      symbol: 'XBTUSD',
      execInst: 'Close',
    };
    const postBody = JSON.stringify(data);
    const headers = bmHeaders(verb, path, postBody);

    const request = unirest.post(config.api.resthost + path);
    request
      .header(headers)
      .send(postBody)
      .end((response) => {
        if (response.code === 200) {
          console.log('position closed');
          return resolve(response);
        }
        console.log('position could not be closed');
        return reject(response);
      });
  });
};

BitMEX.prototype.deleteOrder = function deleteUOrder(orderId) {
  return new Promise((resolve, reject) => {
    const verb = 'DELETE';
    const path = '/api/v1/order';
    const data = {
      orderID: orderId,
      symbol: 'XBTUSD',
      execInst: 'Close',
    };
    const postBody = JSON.stringify(data);
    const headers = bmHeaders(verb, path, postBody);

    const request = unirest.delete(config.api.resthost + path);
    request
      .header(headers)
      .send(postBody)
      .end((response) => {
        if (response.code === 200) {
          console.log('position closed');
          return resolve(response);
        }
        console.log('position could not be closed');
        return reject(response);
      });
  });
};

BitMEX.prototype.deleteUOrder = function deleteUOrder(orderId) {
  return new Promise((resolve, reject) => {
    const verb = 'DELETE';
    const path = '/api/v1/order';
    const data = {
      clOrdID: orderId,
      symbol: 'XBTUSD',
      execInst: 'Close',
    };
    const postBody = JSON.stringify(data);
    const headers = bmHeaders(verb, path, postBody);

    const request = unirest.delete(config.api.resthost + path);
    request
      .header(headers)
      .send(postBody)
      .end((response) => {
        if (response.code === 200) {
          console.log('position closed');
          return resolve(response);
        }
        console.log('position could not be closed');
        return reject(response);
      });
  });
};

BitMEX.prototype.setStopLoss = function setStopLoss(side, stopPrice) {
  return new Promise((resolve, reject) => {
    // choose opposite side of order side here
    const newSide = side === 'LONG' ? 'Sell' : 'Buy';
    const verb = 'POST';
    const path = '/api/v1/order';
    const data = {
      symbol: 'XBTUSD',
      side: newSide,
      stopPx: stopPrice,
      ordType: 'Stop',
      execInst: 'Close, LastPrice',
    };
    const postBody = JSON.stringify(data);
    const headers = bmHeaders(verb, path, postBody);

    const request = unirest.post(config.api.resthost + path);
    request
      .header(headers)
      .send(postBody)
      .end((response) => {
        if (response.code === 200) {
          console.log('stop loss set');
          return resolve(response);
        }
        console.log(`could not set stop loss for position${JSON.stringify(response)}`);
        return reject(response);
      });
  });
};

exports.BitMEX = new BitMEX();
