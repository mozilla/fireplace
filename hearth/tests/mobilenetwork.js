(function() {
var a = require('assert');
var assert = a.assert;
var contains = a.contains;
var eq_ = a.eq_;
var mock = a.mock;

var mobilenetwork = require('mobilenetwork');
var user = require('user');
var utils = require('utils');

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

test('no carrier+region', function(done) {
    user.clear_settings();
    eq_(user.get_setting('carrier'), null);
    eq_(user.get_setting('region'), null);

    var navigator_ = {mozMobileConnection: null};
    mobilenetwork.detectMobileNetwork(navigator_);

    eq_(user.get_setting('carrier'), null);
    eq_(user.get_setting('region'), null);

    done();
});

test('carrier+region for Telefónica España SIM via querystring', function(done, fail) {
    function update_settings(data) {
        try {
            eq_(data.carrier, 'telefonica');
            eq_(data.region, 'es');
            done();
        } catch(e) {
            fail(e);
        }
    }
    mock(
        'mobilenetwork',
        {
            user: {
                get_setting: function() { return null; },
                get_settings: function() { return {}; },
                update_settings: update_settings
            },
            utils: {
                _pd: utils._pd,
                getVars: function() { return {mcc: '214', mnc: '005'}; },
            }
        }, function(mobilenetwork) {
            user.clear_settings();
            mobilenetwork.detectMobileNetwork({}, true);
        }
    );
});

test('carrier+region for Telefónica España SIM via navigator.mozMobileConnection', function(done) {
    user.clear_settings();

    var navigator_ = {mozMobileConnection: {lastKnownNetwork: '214-005'}};
    mobilenetwork.detectMobileNetwork(navigator_);

    eq_(user.get_setting('carrier'), 'telefonica');
    eq_(user.get_setting('region'), 'es');

    done();
});

test('region for unknown España SIM via navigator.mozMobileConnection', function(done) {
    user.clear_settings();

    var navigator_ = {mozMobileConnection: {lastKnownNetwork: '214-999'}};
    mobilenetwork.detectMobileNetwork(navigator_);

    eq_(user.get_setting('carrier'), null);
    eq_(user.get_setting('region'), 'es');

    done();
});

})();
