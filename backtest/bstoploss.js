const bconfig = require('./bconfig.js');

// eslint-disable-next-line
function fixed(stopLoss, orderType, curr) {
  // fixed stop loss does nothing
  return stopLoss;
}

function trail(stopLoss, orderType, curr) {
  let newStop = stopLoss;

  // Calculate for long positions
  if (orderType === 'LONG') {
    if (curr.close > curr.open) {
      const candleSize = curr.close - curr.open;
      const moveSize = Math.round(candleSize * bconfig.stopTrail);
      newStop = Math.round(stopLoss + moveSize);

      return newStop;
    }
    return newStop;
  }

  // calc for SHORT positions
  if (curr.open > curr.close) {
    const candleSize = curr.open - curr.close;
    const moveSize = Math.round(candleSize * bconfig.stopTrail);
    newStop = Math.round(stopLoss - moveSize);

    return newStop;
  }
  return newStop;
}

function stop(stopLoss, orderType, curr) {
  let newStop = stopLoss;

  switch (bconfig.stop) {
    case 'FIXED':
      newStop = fixed(stopLoss, orderType, curr);
      break;
    case 'TRAIL':
      newStop = trail(stopLoss, orderType, curr);
      break;
    default:
      newStop = fixed(stopLoss, orderType, curr);
      break;
  }

  return newStop;
}

module.exports = { stop };
