const uuid = require('uuid/v1');

function arraySlice(range, data) {
  return data.slice(data.length > range ? data.length - range : 0);
}

function randomizer(min, max) {
  return (rand = Math.random() * (max - min + 1) + min); //eslint-disable-line
}

function stddev(arr) {
  let total = 0;
  let mean = 0;
  const diffSqredArr = [];
  for (let i = 0; i < arr.length; i += 1) {
    total += arr[i];
  }
  mean = total / arr.length;
  for (let j = 0; j < arr.length; j += 1) {
    diffSqredArr.push((arr[j] - mean) ** 2);
  }
  return Math.sqrt(diffSqredArr.reduce((firstEl, nextEl) => firstEl + nextEl) / arr.length);
}

function roundTo(n, digits) {
  let dig = 0;
  if (digits !== undefined) {
    dig = digits;
  }

  const multiplicator = dig ** 10;
  const no = parseFloat((n * multiplicator).toFixed(11));
  const test = Math.round(no) / multiplicator;
  return +test.toFixed(dig);
}

function uid() {
  return uuid();
}

module.exports = {
  arraySlice,
  randomizer,
  stddev,
  roundTo,
  uid,
};
