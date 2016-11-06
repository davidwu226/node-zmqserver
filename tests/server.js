var zmqserver = require('../index');
var server = new zmqserver.Server("server", function(msg, done) {
    msg.password = 'open';
    done();
});

server.start("tcp://127.0.0.1:4000");

server.add_handler("hello", function(msg, reply) {
    console.log(JSON.stringify(msg));
    reply({value: "Goodbye, "+msg.name+"!"});
});
server.start("tcp://127.0.0.1:4000");
