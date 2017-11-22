const utils = require('../../utils.js');

const sampleSize = 200;
const orderbookSize = 20;

function process(data) {
  console.clear();
  console.time('time---');
  const buy = [];
  const sell = [];

  // slice off a small section of the bid/ask table
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].side === 'Buy') {
      const tmp = {
        price: data[i].price,
        size: data[i].size,
      };
      buy.push(tmp);
    }
    if (data[i].side === 'Sell') {
      const tmp = {
        price: data[i].price,
        size: data[i].size,
      };
      sell.push(tmp);
    }
    if (buy.length > sampleSize) buy.pop();
    if (sell.length > sampleSize) sell.shift();
  }

  // create an array of unique prices and sort them
  const bordtmp = buy
    .map(x => parseFloat(x.price)) // retrieve all the prices
    .filter((v, i, a) => a.indexOf(v) === i) // filter uniques
    .sort(); // sort
  const sordtmp = sell
    .map(x => parseFloat(x.price))
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort();

  const buyPrices = bordtmp.splice(bordtmp.length - orderbookSize, bordtmp.length);
  const sellPrices = sordtmp.splice(0, orderbookSize);

  const buyBook = [];
  const sellBook = [];

  let totalBuyVolume = 0;
  for (let j = 0; j < buyPrices.length; j += 1) {
    let volume = 0;
    for (let i = 0; i < buy.length; i += 1) {
      if (buy[i].price === buyPrices[j]) volume += parseInt(buy[i].size, 10);
    }
    const tmp = { price: buyPrices[j], size: volume };
    buyBook.push(tmp);
    totalBuyVolume += volume;
  }

  let totalSellVolume = 0;
  for (let j = 0; j < sellPrices.length; j += 1) {
    let volume = 0;
    for (let i = 0; i < sell.length; i += 1) {
      if (sell[i].price === sellPrices[j]) volume += parseInt(sell[i].size, 10);
    }
    const tmp = { price: sellPrices[j], size: volume };
    sellBook.push(tmp);
    totalSellVolume += volume;
  }

  const midt = (sellBook[0].price - buyBook[buyBook.length - 1].price) / 2;
  const midPrice = utils.roundTo(buyBook[buyBook.length - 1].price + midt, 2);

  console.log('Buying at:');
  buyBook.forEach((v) => {
    console.log(`\t${v.size}\t${v.price}`);
  });
  console.log('Selling at:');
  sellBook.forEach((v) => {
    console.log(`\t\t\t${v.price}\t${v.size}`);
  });

  // FIXME instead of this calculate actual volume order imbalance!!!
  console.log(`Mid Price: ${midPrice} Volume Order Imbalance = ${totalSellVolume - totalBuyVolume}`);
  console.timeEnd('time---');
  console.log('----------------------------------------------------');
}

module.exports = { process };
