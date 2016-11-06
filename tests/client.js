var zmqserver = require('../index');
var client = new zmqserver.Client("client", function(msg, done) {
    msg.password = 'open';
    done();
});

client.start("tcp://127.0.0.1:4000");

setTimeout(function() {
    client.request("server", {request: "hello",
                              name: "Bob"},
                   function(err, data) {
                       if (err) {
                           console.log("ERROR: "+err);
                       } else {
                           console.log(JSON.stringify(data));
                       }
                   });
}, 500);
