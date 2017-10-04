const config = require('./config');
const redis = require('redis');

const { port, host } = config.redis;

module.exports = redis.createClient(port, host, { no_ready_check: true });
