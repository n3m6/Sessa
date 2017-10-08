// const config = require('./config');
const OrderMonitor = function OrderMonitor() {
  this.lastid = 0;
};

OrderMonitor.prototype.monitor = function monitor(data) {
  // loop through all the recent updates
  if (data.length > 0) {
    console.log(data.length);
    // console.log(data);
    for (let i = this.lastid; i < data.length; i += 1) {
      const curr = i;

      console.log(`${curr}\t${data[curr].side}\t${data[curr].orderQty}\t${data[curr].price}\t${data[curr]
        .ordType}\t${data[curr].ordStatus}\t\t${data[curr].avgPx}\t${data[curr].orderID}\t${data[
        curr
      ].clOrdID}`);

      if (data[curr].ordType === 'Stop' && data[curr].ordStatus === 'Filled') {
        console.log('Stop triggered');
      }
    }
  }
  // this.lastid = data.length - 1;
};

exports.OrderMonitor = new OrderMonitor();
