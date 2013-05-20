(function() {
var a = require('assert');
var eq_ = a.eq_;

var mobilenetwork = require('mobilenetwork');

// Region can be inferred from MCC.
// Carrier can be inferred from MCC+MNC.

test('no MCC, no MNC', function(done) {
    var network = mobilenetwork.getNetwork('', '');
    eq_(network.region, null);
    eq_(network.carrier, null);
    done();
});

test('yes MCC, no MNC', function(done, fail) {
    var network = mobilenetwork.getNetwork('214', '');
    eq_(network.region, 'es');
    eq_(network.carrier, null);
    done();
});

test('no MCC, yes MNC', function(done, fail) {
    var network = mobilenetwork.getNetwork('', '005');
    eq_(network.region, null);
    eq_(network.carrier, null);
    done();
});

test('yes MCC, yes MNC', function(done, fail) {
    var network = mobilenetwork.getNetwork('214', '005');
    eq_(network.region, 'es');
    eq_(network.carrier, 'telefonica');
    done();
});

})();
