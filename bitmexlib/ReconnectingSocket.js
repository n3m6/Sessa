const WebSocket = require('ws');
// const debug = require('debug')('BitMEX:realtime-api:socket:internal');

const WebSocketClient = function WebSocketClient() {
  this.autoReconnectInterval = 5000; // ms
  this.logConnection = true;
};

WebSocketClient.prototype.open = function open(url) {
  this.url = url;
  this.instance = new WebSocket(this.url);

  this.instance.on('open', () => {
    this.log('Connected.');
    this.onopen();
  });

  this.instance.on('message', (data, flags) => {
    this.onmessage(data, flags);
  });

  this.instance.on('close', (code) => {
    let reconnecting = false;

    switch (code) {
      case 1000: // CLOSE_NORMAL
        // debug('Closed');
        this.log(`Code: ${code} Websocket closed normally.`);
        break;
      case 1001: // GOING AWAY
        this.log(`Code: ${code} Server down.`);
        reconnecting = true;
        break;
      case 1002:
        this.log(`Code: ${code} Server terminated due to protocol error.`);
        reconnecting = true;
        break;
      case 1003:
        this.log(`Code: ${code} Server terminated connection, unexpected data tye.`);
        reconnecting = true;
        break;
      case 1004:
        this.log(`Code: ${code} Unknown reserved code. Protocol error.`);
        reconnecting = true;
        break;
      case 1005:
        this.log(`Code: ${code} Reserved code. Protocol error.`);
        reconnecting = true;
        break;
      case 1006:
        this.log(`Code: ${code} Reserved code. Protocol error.`);
        reconnecting = true;
        break;
      case 1007:
        this.log(`Code: ${code} Reserved code. Protocol error.`);
        reconnecting = true;
        break;
      case 1008:
        this.log(`Code: ${code} Protocol error.`);
        reconnecting = true;
        break;
      case 1009:
        this.log(`Code: ${code} Server terminated connection. Data packet size maybe too big.`);
        reconnecting = true;
        break;
      case 1010:
        this.log(`Code: ${code} Handshake failed.`);
        reconnecting = true;
        break;
      case 1011: // UNEXPECTED_CONDITION
        this.logError(`Code: ${code} Unexpected condition. Closing Websocket`);
        reconnecting = true;
        break;
      default:
        // Abnormal closure
        this.logError(`Code: ${code} Abnormal event. Websocket closed.`);
        reconnecting = true;
        break;
    }
    this.onclose(code);

    // if websocket needs reconnecting
    if (reconnecting) {
      this.reconnect(code);
    } else {
      this.onend(code);
    }
  });

  this.instance.on('error', (e) => {
    // FIXME rework this to reconnect and try again on error

    if (e.code) {
      this.logError('Error on connection.', e.message);
    }
    switch (e.code) {
      case 'ECONNREFUSED':
        break;
      default:
        this.onerror(e);
        break;
    }
  });

  this.instance.on('unexpected-response', (request, response) => {
    // Parse body
    let buf = '';
    response.on('data', (data) => {
      buf += data;
    });

    response.on('end', () => {
      if (response.statusCode === 401) {
        this.logError(`Authentication invalid. Please check your credentials. Message: ${buf}`);
      } else {
        this.logError(`Unexpected response from server [${response.statusCode}]: ${buf}`);
      }

      this.log('The WebSocket will terminate. Please manually reconnect.');
      request.abort();
      this.instance.close(1011);
      this.instance.emit('close', 1011);
    });
  });
};

// Forward eventemitter methods
['on', 'off', 'once', 'addListener', 'removeListener', 'emit'].forEach((key) => {
  WebSocketClient.prototype[key] = function (...args) {
    // this.instance[key].apply(this.instance, arguments); // eslint-disable-line
    this.instance[key](...args);
  };
});

WebSocketClient.prototype.log = function log(...args) {
  if (!this.logConnection) return;
  console.log('WebSocket:'.concat(...args));
};

WebSocketClient.prototype.logError = function logError(...args) {
  console.error('WebSocket ERROR:'.concat(...args));
};

WebSocketClient.prototype.send = function send(data, option) {
  try {
    // debug(data);
    this.instance.send(data, option);
  } catch (e) {
    this.instance.emit('error', e);
  }
};

WebSocketClient.prototype.reconnect = function reconnect(_code) {
  this.emit('reconnect');
  this.log(`Closed code ${_code}. Retry in ${this.autoReconnectInterval} ms`);
  clearTimeout(this.reconnectTimeout);
  this.reconnectTimeout = setTimeout(() => {
    // FIXME should this code be 1000? wouldn't it close after 1 retry?
    this.instance.close(1000, 'Reconnecting.');
    this.log('Reconnecting...');
    this.open(this.url);
  }, this.autoReconnectInterval);
};

module.exports = WebSocketClient;
