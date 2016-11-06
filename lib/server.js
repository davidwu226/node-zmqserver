var zmq = require('zmq');

function Server(id, login_cb) {
    this.REQUEST_HANDLER = {};

    var sock = this.sock = zmq.socket('dealer');
    var self = this;

    this.secret = "";

    sock.monitor(500, 0);
    sock.identity = id;

    sock.on('connect', function() {
        function login_done() {                        
            sock.send(["", JSON.stringify(msg)]);
        }
        
        var msg = {
            action: 'LOGIN',
            id: id
        };
        
        if (login_cb != undefined) {
            login_cb(msg, login_done);
        } else {
            login_done();
        }
    });
    
    sock.on('message', function(target_id, data) {
        try {
            var msg = JSON.parse(data);
            if (msg.action == 'SECRET') {
                self.secret = msg.data;
            } else if (msg.err) {
                console.log("Server recieved error: "+msg.err);
            } else {
                var req = msg.data;
                var handler = self.REQUEST_HANDLER[req.request];
                if (handler != undefined) {
                    handler(req, function(reply) {
                        var out = {
                            action: 'REPLY',
                            secret: self.secret,
                            seq: msg.seq,
                            data: reply
                        };
                        sock.send([target_id, JSON.stringify(out)]);
                    });
                }
            }
        } catch(err) {
            console.log("Server message handler failed: "+err.stack);
        }
    });
}

Server.prototype.add_handler = function(name, handler) {
    if (handler != undefined) {
        this.REQUEST_HANDLER[name] = handler;
    } else {
        delete this.REQUEST_HANDLER[name];
    }
};

Server.prototype.remove_handler = function(name) {
    delete this.REQUEST_HANDLER[name];
};

Server.prototype.start = function(connect_address) {
    this.sock.connect(connect_address);
};

module.exports = Server;
