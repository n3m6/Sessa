const positions = {
  XBTUSD: {
    activeTrade: false, // is there an active trade with this curr/commodity
    exchange: 'BitMEX',
    orderID: '', // unique identifier, will be used in tdb able as well
    orderType: '', // LONG or SHORT (not Buy or Sell)
    contracts: 0, // number of contracts bought
    value: 0, // total value of contracts in play
  },
};

module.exports = positions;
