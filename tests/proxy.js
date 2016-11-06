var zmqserver = require('../index');
var proxy = new zmqserver.Proxy();

proxy.start("tcp://127.0.0.1:4000", "tcp://127.0.0.1:4001");
