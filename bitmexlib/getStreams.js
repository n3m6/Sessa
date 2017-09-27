const superagent = require('superagent');
const url = require('url');
// const debug = require('debug')('BitMEX:realtime-api:getStreams');

function filter(err, res, callback) {
  if (err) {
    callback(err);
  } else {
    const streams = res.body.subscriptionSubjects;
    // debug('Got streams from server: %j', streams);
    callback(null, {
      public: streams.public,
      private: streams.authenticationRequired,
      all: streams.public.concat(streams.authenticationRequired),
    });
  }
}

module.exports = function getStreams(wsEndpoint, callback) {
  const parsed = url.parse(wsEndpoint);
  const httpEndpoint = url.format({
    protocol: parsed.protocol === 'wss:' ? 'https:' : 'http',
    host: parsed.host,
  });

  superagent
    .get(`${httpEndpoint}/api/v1/schema/websocketHelp`)
    .end((err, res) => filter(err, res, callback));
};
