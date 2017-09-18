const config = require('./config');
const unirest = require('unirest');
const crypto = require('crypto');

const Trade = function Trade() {};

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

Trade.prototype.placeOrder = function placeOrder(orderType, currentPrice) {
  const side = orderType === 'BUY' ? 'Buy' : 'Sell';
  this.getBitMexBalance()
    .then(balance => this.determineOrderQty(currentPrice, balance))
    .then(orderSize => this.bitMexMarketOrder(side, orderSize))
    .then(response => console.log(JSON.stringify(response.body)))
    .catch(error => console.error(`error ${error}`));

  return true;
};

Trade.prototype.stopOrder = function stopOrder(position) {
  // console.log(`completed transaction ${position.orderType}`);
  return true;
};

exports.Trade = new Trade();

const trade = new Trade();
const currentXBTUSDValue = 3784;
const side = 'Sell';

// Test adjusting the margin

// TEST CODE BELOW
// FIXME: remove test code after testing

/* const positions = {
  XBTUSD: {
    activeTrade: false, // is there an active trade with this currency
    orderType: '', // long or short
    contracts: 0, // number of contracts bought
    value: 0, // total value of contracts in play
  },
};

const trade = new Trade();
const prices = [];

for (let i = 0; i < 500; i += 1) {
  let open = 0;
  let close = 0;
  let high = 0;
  let low = 0;

  if (i === 0) {
    open = Math.abs(utils.roundTo(utils.randomizer(10, 30), 2));
    high = Math.abs(utils.roundTo(utils.randomizer(open + 1, open + 7), 2));
    low = Math.abs(utils.roundTo(utils.randomizer(close - 7, close - 1), 2));
    close = Math.abs(utils.roundTo(utils.randomizer(high, low), 2));
  } else {
    open = prices[i - 1].close;
    high = Math.abs(utils.roundTo(utils.randomizer(open + 1, open + 7), 2));
    low = Math.abs(utils.roundTo(utils.randomizer(close - 7, close - 1), 2));
    close = Math.abs(utils.roundTo(utils.randomizer(high, low), 2));
  }
  prices.push({
    open,
    high,
    low,
    close,
  });
}

// Header
console.log('#\tOpen\tClose\tSMA\tMACD\tRSI\tPstn\tType');

for (let i = 0; i < prices.length; i += 1) {
  let arr = [];
  if (prices.length === 1) {
    [arr] = prices;
  } else {
    arr = prices.slice(0, i + 1);
  }
  const currCandle = prices[i];

  const rsi = utils.roundTo(fin.rsi(arr, 14), 2);
  const macd = utils.roundTo(fin.macd(arr, 12, 26, 9), 2);
  const sma = utils.roundTo(fin.sma(arr, 20), 2);

  if (positions.XBTUSD.activeTrade) {
    // if there's an active trade check wither we should sell it now
    if (trade.threeGreenExit(currCandle.close, sma, positions.XBTUSD)) {
      positions.XBTUSD.activeTrade = false;
      positions.XBTUSD.orderType = '';

      // Stop the actual transaction
      trade.stopOrder(positions.XBTUSD);
    }
  } else {
    // check whether we should enter a trade
    [positions.XBTUSD.activeTrade, positions.XBTUSD.orderType] = trade.threeGreenEnter(
      currCandle.close,
      sma,
      macd,
      rsi,
    );
    if (positions.XBTUSD.activeTrade) {
      // if an order needs to place, place it here
      trade.placeOrder(positions.XBTUSD.orderType);
    }
  }

  console.log(`${i}\t${currCandle.open}\t${currCandle.close}\t${sma}\t${macd}\t${rsi}\t${positions.XBTUSD
    .activeTrade}\t${positions.XBTUSD.orderType}`);
} */
