var zmq = require('zmq');

var MAX64 = Math.pow(2, 64)-1;
function generate_secret() {
    return Math.floor(Math.random() * MAX64);
}
           
function Router(auth_cb) {
    
    var sock = this.sock = zmq.socket('router');
    sock.setsockopt(zmq.ZMQ_ROUTER_MANDATORY, 1);

    var SECRETS = {};
    
    sock.on('message', function(sender_id, target_id, data) {
        var out = undefined;
        try {
            var msg = {};
            try {
                msg = JSON.parse(data);
            } catch(err) {
                // Ignore parse errors.
            }
            if (target_id == "") {
                if (msg.action == 'LOGIN') {
                    function auth_done(success) {
                        var out;
                        if (success) {
                            var secret = SECRETS[sender_id] =
                                generate_secret();
                            out = {
                                action: 'SECRET',
                                data: secret
                            };
                        } else {
                            out = {
                                err: 'authorization failed'
                            };
                        }
                        try {
                            sock.send([sender_id, sender_id,
                                       JSON.stringify(out)]);
                        } catch(err) {
                            console.log("Router errored sending secret.");
                        }
                    }

                    if (auth_cb) {
                        auth_cb(sender_id, msg, auth_done);
                    } else {
                        auth_done(true);
                    }
                    return;
                } else {
                    target_id = sender_id;
                    out = {
                        err: 'invalid command'
                    };
                }
            } else {
                if ((msg.secret == undefined) ||
                    (SECRETS[sender_id] != msg.secret)) {
                    target_id = sender_id;
                    out = {
                        err: 'bad secret',
                        seq: msg.seq
                    };                    
                } else {
                    out = msg;
                    delete out.secret;
                }
            }
            
            if (out != undefined) {
                try {
                    sock.send([target_id, sender_id, JSON.stringify(out)]);
                } catch(err) {
                    out = {
                        err: 'scanner not connected',
                        seq: msg.seq
                    };
                    try {
                        sock.send([sender_id, sender_id, JSON.stringify(out)]);
                    } catch(err) {
                        console.log("Router errored sendering error back.");
                    }
                }
            } else {
                console.log("error in routing message.");
                return;
            }
        } catch(err) {
            console.log("QeueueRouter.message failed: "+err);
        }
    });
}

Router.prototype.start = function(listen_address) {
    this.listen_address = listen_address;
    this.sock.bindSync(listen_address);
};

Router.prototype.stop = function() {
    this.sock.unbind(this.listen_address);
    delete this.listen_address;
};

module.exports = Router;

