## Synopsis

A trader bot (currently only handles cryptocurrencies on BitMex).

## Installation

requires a redis db.
add redis db details to config.js
npm install the modules in package.json dependencies.
When in production change config.js key 'testnet' to false

Not ideal, but this is how you change strategy and timeframe
Strategy can be changed in the strategy.js file
Time frame can be changed in the main.js file

## Running

run delta/delta.js to start collecting data
run main.js for trading.

alternatively just run start-sessa (requires forever to be installed)

## Backtesting

A backtesting suite is included, just run backtest.js for additional help.

## Note on BitMEX Library

This program uses an older modified version of the BitMEX library, since the original BitMEX library handled dropped connections extremely poorly. It has some issues since the original BitMEX library has been updated a few times. Ideally, in a future version we'll include a simple patch you could apply to whatever was the current BitMEX library.

## License

MIT License Copyright (c) 2017 Abdulla Faraz.
