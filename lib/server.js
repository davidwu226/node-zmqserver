var zmq = require('zmq');

function Server(id, login_cb) {
    this.REQUEST_HANDLER = {};

    var sock = this.sock = zmq.socket('dealer');
    var self = this;

    this.secret = "";

    sock.monitor(500, 0);
    sock.identity = ""+id;

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
            var msg = {};
            try {
                msg = JSON.parse(data);
            } catch(err) {
                // Ignore parse errors.
            }

            if (msg.action == 'SECRET') {
                self.secret = msg.secret;
                if (self.connected_cb != undefined) {
                    self.connected_cb();
                    delete self.connected_cb;
                }
            } else if (msg.err) {
                console.log("Server recieved error: "+msg.err);
            } else {
                var req = msg.data;
                // msg.data is always a string, so we need to
                // convert it back to an object.
                try {
                    req = JSON.parse(req);
                } catch {
                    req = undefined
                }
                
                if (req == undefined || req.request == undefined) {
                    // Ignore badly formed data.
                    return;
                }
                
                var handler = self.REQUEST_HANDLER[req.request];
                if (handler != undefined) {
                    handler(req, function(reply) {
                        var out = {
                            action: 'REPLY',
                            secret: ""+self.secret,
                            seq: ""+msg.seq,
                            data: JSON.stringify(reply)
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

Server.prototype.start = function(connect_address, connected_cb) {
    this.connect_address = connect_address;
    this.sock.connect(connect_address);
    if (connected_cb != undefined) {
        this.connected_cb = connected_cb;
    } else {
        delete this.connected_cb;
    }    
};

Server.prototype.stop = function() {
    this.sock.disconnect(this.connect_address);
    delete this.connect_address;
};

module.exports = Server;
