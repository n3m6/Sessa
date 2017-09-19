const redis = require('redis');

const port = 6379;
const host = 'localhost';
module.exports = redis.createClient(port, host, { no_ready_check: true });
