var zmqserver = require('../index');
var proxy = new zmqserver.Proxy();

proxy.start("tcp://127.0.0.1:4000", "tcp://127.0.0.1:4001");

setTimeout(function() {
    console.log("closing");
    proxy.stop();
    setTimeout(function() {
        console.log("opening again");
        proxy.start("tcp://127.0.0.1:4000", "tcp://127.0.0.1:4001");
    }, 50);
}, 50);
