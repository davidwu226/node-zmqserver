var zmqserver = require('../index');
var router = new zmqserver.Router();

router.start("tcp://127.0.0.1:4000");

