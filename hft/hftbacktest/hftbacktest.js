const fs = require('fs');
const es = require('event-stream');
const engine = require('./hbengine.js');

// const filename = '1509554481253.log';
const filename = '1509622783126.log';

const s = fs
  .createReadStream(filename)
  .pipe(es.split())
  .pipe(es
    .mapSync((data) => {
      s.pause();

      engine.process(JSON.parse(data));

      s.resume();
    })
    .on('error', err => console.error(`error while reading file${err}`))
    .on('end', () => console.log('Read entire file')));
