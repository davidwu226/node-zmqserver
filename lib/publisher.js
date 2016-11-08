var zmq = require('zmq');

function Publisher(id) {
    var sock = this.sock = zmq.socket('pub');
    var self = this;

    if (id != undefined) {
        sock.identity = ""+id;
    }
}

Publisher.prototype.publish = function(key, value) {
    this.sock.send([key, value]);
};

Publisher.prototype.start = function(connect_address) {
    this.connect_address = connect_address;
    this.sock.connect(connect_address);    
};

Publisher.prototype.stop = function() {
    this.sock.disconnect(this.connect_address);
    delete this.connect_address;
};

module.exports = Publisher;
