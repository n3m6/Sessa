function arraySlice(range, data) {
  return data.slice(data.length > range ? data.length - range : 0);
}

function randomizer(min, max) {
  return (rand = Math.random() * (max - min + 1) + min); //eslint-disable-line
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

module.exports = {
  arraySlice,
  randomizer,
  roundTo,
};
