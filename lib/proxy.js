var zmq = require('zmq');

function Proxy() {
    var xpub = this.xpub = zmq.socket('xpub');
    var xsub = this.xsub = zmq.socket('xsub');

    xsub.on('message', function(x, y) {
        if (y != undefined) {
            xpub.send([x, y]);
        } else {
            xpub.send(x);
        }
    });


    xpub.on('message', function(x, y) {
        xsub.send(x);
    });
}

Proxy.prototype.start = function(pub_address, sub_address) {
    this.pub_address = pub_address;
    this.sub_address = sub_address;
    this.xpub.bindSync(pub_address);
    this.xsub.bindSync(sub_address);
};

Proxy.prototype.stop = function() {
    this.xpub.unbind(this.pub_address);
    this.xsub.unbind(this.sub_address);
    delete this.pub_address;
    delete this.sub_address;
};

module.exports = Proxy;
