var zmqserver = require('../index');

var pub = new zmqserver.Publisher();
pub.start("tcp://127.0.0.1:4001");

var stocks = ['AAPL', 'GOOG', 'YHOO', 'MSFT', 'INTC'];
var symbol = stocks[Math.floor(Math.random()*stocks.length)];

setInterval(function() {
    var  value = Math.random()*1000;
    pub.publish(symbol, value);
}, 100);

             
