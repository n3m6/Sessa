const bconfig = {};

// how many times to rerun the test to normalize results
bconfig.norm = 3;

// Stop loss, options are 'FIXED' or 'TRAIL'
bconfig.stop = 'TRAIL';
bconfig.stopTrail = 0.3;

module.exports = bconfig;
