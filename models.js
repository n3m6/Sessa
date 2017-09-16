const positions = {
  XBTUSD: {
    activeTrade: false, // is there an active trade with this currency
    orderType: '', // long or short
    contracts: 0, // number of contracts bought
    value: 0, // total value of contracts in play
  },
};

module.exports = positions;
