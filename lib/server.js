var zmq = require('zmq');

function Server(id) {
    this.REQUEST_HANDLER = {};

    var sock = this.sock = zmq.socket('dealer');
    var self = this;
    
    sock.monitor(500, 0);
    
    sock.on('connect', function() {
        var msg = {
            action: 'LOGIN',
            id: id
        };
        
        sock.send(JSON.stringify(msg));
    });
    
    sock.on('message', function(data) {
        try {
            var msg = JSON.parse(data);
            if (msg.action == 'REQ') {
                var req = msg.data;
                var handler = self.REQUEST_HANDLER[req.request];
                if (handler != undefined) {
                    handler(req, function(reply) {
                        var out = {
                            action: 'REPLY',
                            seq: msg.seq,
                            target: msg.target,
                            data: reply
                        };
                        sock.send(JSON.stringify(out));                        
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
