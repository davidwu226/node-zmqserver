var zmqserver = require('../index');
var router = new zmqserver.Router(function(sender_id, msg, auth) {
    if (msg.password == "open") {
        auth(true);
    } else {
        auth(false);
    }
});

router.start("tcp://0.0.0.0:4000");

