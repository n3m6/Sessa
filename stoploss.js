const config = require('./config.js');

// eslint-disable-next-line
function fixed(stopLoss, args) {
  // fixed stop loss does nothing
  return [false, stopLoss];
}

function trail(dbStop, args) {
  const { open, close, orderType } = args;

  // calc for LONG positions
  if (orderType === 'LONG') {
    if (close > open) {
      const candleSize = parseFloat(close) - parseFloat(open);
      const moveSize = Math.round(candleSize * config.stopTrail);
      const newPrice = Math.round(parseFloat(dbStop) + moveSize);

      return [true, newPrice];
    }
    return [false, dbStop];
  }

  // calc for SHORT positions
  if (open > close) {
    const candleSize = parseFloat(open) - parseFloat(close);
    const moveSize = Math.round(candleSize * config.stopTrail);
    const newPrice = Math.round(parseFloat(dbStop) - moveSize);

    return [true, newPrice];
  }
  return [false, dbStop]; // move: true or false, newprice
}

function stop(stopLoss, args) {
  let newStop = stopLoss;

  switch (config.stop) {
    case 'FIXED':
      newStop = fixed(stopLoss, args);
      break;
    case 'TRAIL':
      newStop = trail(stopLoss, args);
      break;
    default:
      newStop = fixed(stopLoss, args);
      break;
  }

  return newStop;
}

module.exports = { stop };
