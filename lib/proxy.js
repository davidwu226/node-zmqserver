var zmq = require('zmq');

function Proxy() {
    var xpub = this.xpub = zmq.socket('xpub');
    var xsub = this.xsub = zmq.socket('xsub');

    zmq.proxy(xpub, xsub);
}

Proxy.prototype.start = function(pub_address, sub_address) {
    this.xpub.bindSync(pub_address);
    this.xsub.bindSync(sub_address);
};

module.exports = Proxy;
