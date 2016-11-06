var zmq = require('zmq');

function Client(id) {
    this.REPLY_HANDLER = {};
    
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
            var handler = self.REPLY_HANDLER[msg.seq];
            if (handler != undefined) {
                delete self.REPLY_HANDLER[msg.seq];
                handler(msg.err, msg.data);
            }
        } catch(err) {
            console.log("Client message handler failed: "+err.stack);
        }
    });
}

var max64 = Math.pow(2, 64)-1;
Client.prototype.request = function(target, req, callback) {    
    var seq;
    while ((seq = Math.floor(Math.random() * max64)) in this.REPLY_HANDLER);
    this.REPLY_HANDLER[seq] = callback;
    var msg = {
        action: 'REQ',
        seq: seq,
        target: target,
        data: req
    };
    this.sock.send(JSON.stringify(msg));
};

Client.prototype.start = function(connect_address) {
    this.sock.connect(connect_address);
};

module.exports = Client;
