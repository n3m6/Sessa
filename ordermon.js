// Run this to monitor orders

const config = require('./config');
const BitmexClient = require('bitmex-realtime-api');

const client = new BitmexClient(config.bitmexConfig);

client.on('error', console.error);
client.on('open', () => console.log('connection opened.'));
client.on('close', () => console.log('connecttion closed.'));
client.on('initialize', () => console.log('initialized, waiting for data'));

console.log('#\tSide\tQty\tPrice\tType\tStatus\t\tavgPrce\torderID\tclOID');
client.addStream('XBTUSD', 'order', (data) => {
  const curr = data.length - 1;
  if (data.length > 0) {
    console.log(`${data.length}\t${data[curr].side}\t${data[curr].orderQty}\t${data[curr].price}\t${data[curr]
      .ordType}\t${data[curr].ordStatus}\t\t${data[curr].avgPx}\t${data[curr].orderID}\t${data[
      curr
    ].clOrdID}`);
  }
});
