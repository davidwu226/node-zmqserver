var zmqserver = require('../index');
var client = new zmqserver.Client("client");

client.start("tcp://192.168.1.151:8011", function() {   
    client.request("SPlhGVpgrhrFWOmt8TTVZ5", {request: 'SCAN'}, function(err, data) {
        if (err) {
            console.log("ERR: "+err);
        } else {
            console.log(JSON.stringify(data, null, 2));
        }
    });
});
