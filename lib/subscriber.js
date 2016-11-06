var zmq = require('zmq');

function Subscriber(id) {
    this.HANDLERS = {};
    
    var sock = this.sock = zmq.socket('sub');
    var self = this;

    if (id != undefined) {
        sock.identity = id;
    }

    sock.on('message', function(key, value) {
        try {
            key = key.toString();
            console.log(key+": "+value);
            var v = JSON.parse(value);
            var cb = self.HANDLERS[key];
            if (cb != undefined) {
                cb(value);
            } else {
                console.log("Subscriber for "+key+" has no handler.");
            }
        } catch(err) {
            console.log("Subscriber message handler failed: "+err.stack);
        }
    });
}

Subscriber.prototype.subscribe = function(key, cb) {
    if (cb != undefined) {
        this.HANDLERS[key] = cb;
        this.sock.subscribe(key);
    } else {
        delete this.HANDLERS[key];
        this.sock.unsubscribe(key);
    }
};

Subscriber.prototype.unsubscribe = function(key) {
    delete this.HANDLERS[key];
    this.sock.unsubscribe(key);
};

Subscriber.prototype.start = function(connect_address) {
    this.connect_address = connect_address;
    this.sock.connect(connect_address);    
};

Subscriber.prototype.stop = function() {
    this.sock.disconnect(this.connect_address);
    delete this.connect_address;
};

module.exports = Subscriber;
