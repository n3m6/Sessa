const config = require('./config');
const unirest = require('unirest');
const crypto = require('crypto');

const Trade = function Trade() {};

// FIXME: this is an async function change it to
// handle things in an async fashion

Trade.prototype.getBitMexBalance = function getBitMexBalance() {
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

Trade.prototype.determineOrderQty = function determineOrderQty(price, balance) {
  return new Promise((resolve, reject) => {
    const toXBT = balance / 100000000;
    const dollarValue = price * toXBT;
    const bet = Math.round(dollarValue * config.margin * config.betSize);
    if (price === 0 || balance < 1) return reject();
    return resolve(bet);
  });
};

Trade.prototype.bitMexAdjustMargin = function bitMexAdjustMargin(margin) {
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

Trade.prototype.init = function init() {
  // this.bitMexAdjustMargin(config.margin);
};

Trade.prototype.bitMexMarketOrder = function bitMeMarketxOrder(side, orderQty) {
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

Trade.prototype.openPosition = function openPosition(orderType, currentPrice) {
  const side = orderType === 'LONG' ? 'Buy' : 'Sell';
  this.getBitMexBalance()
    .then(balance => this.determineOrderQty(currentPrice, balance))
    .then(orderSize => this.bitMexMarketOrder(side, orderSize))
    // FIXME remove these console logs
    .then(response => console.log(JSON.stringify(response.body)))
    .catch(error => console.error(`error ${error}`));

  // FIXME fix this return it, it should return more information
  // and it should add those inforation to the position model
  return true;
};

Trade.prototype.bitMexClosePosition = function bitMexClosePosition(orderId) {
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
        console.log(response.body);
        // return resolve(response);
      } else {
        console.log(`error: ${JSON.stringify(response.body)}`);
      }
      // return reject(response);
    });
};

Trade.prototype.closePosition = function closePosition(position) {
  // console.log(`completed transaction ${position.orderType}`);
  this.bitMexClosePosition(position.orderID);
};

exports.Trade = new Trade();
