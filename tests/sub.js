var zmqserver = require('../index');

var sub = new zmqserver.Subscriber();
sub.start("tcp://127.0.0.1:4000");

sub.subscribe('AAPL', function(value) {
    console.log("AAPL: "+value);
});

sub.subscribe('GOOG', function(value) {
    console.log("GOOG: "+value);
});

sub.subscribe('YHOO', function(value) {
    console.log("YHOO: "+value);
});

sub.subscribe('MSFT', function(value) {
    console.log("MSFT: "+value);
});

sub.subscribe('INTC', function(value) {
    console.log("INTC: "+value);
});

setTimeout(function() {
    console.log("closing");
    sub.stop();
    setTimeout(function() {
        console.log("starting again");
        sub.start("tcp://127.0.0.1:4000");
    }, 5000);
}, 5000);
