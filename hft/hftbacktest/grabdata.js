const config = require('../../config');
const BitmexClient = require('../../bitmexlib/bitmexlib.js');
const fs = require('fs');

function process(fileStream, d) {
  // write to file
  const data = `${JSON.stringify(d)}\n`;
  fileStream.write(data);
}

const client = new BitmexClient(config.bitmexConfig);

client.on('open', () => console.log('connection opened.'));
client.on('error', err => console.error('caught error', err));
client.on('close', () => console.log('connection closed.'));
client.on('initialize', () => console.log('initialized, waiting for data'));

const filename = `${Date.now()}.log`;
const fileStream = fs.createWriteStream(filename);

// Streaming full level 2 Order Book
client.addStream('XBTUSD', 'orderBookL2', data => process(fileStream, data));
