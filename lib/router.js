var zmq = require('zmq');

function Router() {
    var sock = this.sock = zmq.socket('router');

    var ENVELOP_TO_ID = {};
    var ID_TO_ENVELOP = {};

    function lookup_id(sock, envelop, msg) {
        var out_id = ENVELOP_TO_ID[envelop];
        if (out_id == undefined) {
            var out = {
                seq: msg.seq,
                err: 'login required'
            };
            sock.send([envelop, JSON.stringify(out)]);
        }
        return out_id;
    }
    
    function lookup_envelop(sock, envelop, msg) {
        var out_envelop = ID_TO_ENVELOP[msg.target];
        if (out_envelop == undefined) {
            var out = {
                seq: msg.seq,
                err: 'not connected'
            };
            sock.send([envelop, JSON.stringify(out)]);
        }
        return out_envelop;
    }

    sock.on('message', function(envelop, data) {
        var out_envelop = undefined;
        var out_target = undefined;
        var out = undefined;
        try {
            var msg = JSON.parse(data);
            if (msg.action == 'LOGIN') {
                ENVELOP_TO_ID[envelop] = msg.id;
                ID_TO_ENVELOP[msg.id] = envelop;
                out_envelop = envelop;
                out = {
                    status: 'successful',
                    seq: msg.seq
                };                
            } else if (msg.action == 'REQ') {
                out_envelop = lookup_envelop(sock, envelop, msg);
                out_target = lookup_id(sock, envelop, msg);
                if (out_envelop != undefined) {
                    out = {
                        action: 'REQ',
                        seq: msg.seq,
                        target: out_target,
                        data: msg.data
                    };
                }
            } else if (msg.action == 'REPLY') {
                out_envelop = ID_TO_ENVELOP[msg.target];
                if (out_envelop != undefined) {
                    out = {
                        seq: msg.seq,
                        data: msg.data
                    };
                }
            }
            
            if ((out_envelop != undefined) && (out != undefined)) {
                sock.send([out_envelop, JSON.stringify(out)]);
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
    this.sock.bindSync(listen_address);
};
    
module.exports = Router;

