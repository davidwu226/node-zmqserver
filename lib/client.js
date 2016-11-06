var zmq = require('zmq');

function Client(id, login_cb) {
    this.REPLY_HANDLER = {};
    
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
            } else {
                var handler = self.REPLY_HANDLER[msg.seq];
                if (handler != undefined) {
                    delete self.REPLY_HANDLER[msg.seq];
                    handler(msg.err, msg.data);
                } else if (msg.err) {
                    console.log("Client received error: "+msg.err);
                } else {
                    console.log("Client received invalid message: "+
                                JSON.stringify(msg));
                }
            }
        } catch(err) {
            console.log("Client message handler failed: "+err.stack);
        }
    });
}

var max64 = Math.pow(2, 64)-1;
Client.prototype.request = function(id, req, callback) {    
    var seq;
    while ((seq = Math.floor(Math.random() * max64)) in this.REPLY_HANDLER);
    this.REPLY_HANDLER[seq] = callback;
    var msg = {
        action: 'REQ',
        secret: this.secret,
        seq: seq,
        data: req
    };
    this.sock.send([id, JSON.stringify(msg)]);
};

Client.prototype.start = function(connect_address) {
    this.connect_address = connect_address;
    this.sock.connect(connect_address);    
};

Client.prototype.stop = function() {
    this.sock.disconnect(this.connect_address);
    delete this.connect_address;
};

module.exports = Client;
