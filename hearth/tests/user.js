(function() {
var a = require('assert');
var assert = a.assert;
var eq_ = a.eq_;
var contains = a.contains;
var mock = a.mock;

var user = require('user');

test('no carrier+region', function(done) {
    user.clear_settings();
    eq_(user.get_setting('carrier'), null);
    eq_(user.get_setting('region'), null);

    var navigator_ = {mozMobileConnection: null};
    user.detect_mobile_network(navigator_);

    eq_(user.get_setting('carrier'), null);
    eq_(user.get_setting('region'), null);

    done();
});

test('carrier+region for Telefónica España SIM via querystring', function(done) {
    mock(
        'user',
        {
            utils: {getVars: function() { return {mcc: '214', mnc: '005'}; }}
        }, function(user) {
            user.clear_settings();
            eq_(user.get_setting('carrier'), null);
            eq_(user.get_setting('region'), null);

            user.detect_mobile_network({});

            eq_(user.get_setting('carrier'), 'telefonica');
            eq_(user.get_setting('region'), 'es');

            done();
        }
    );
});

test('carrier+region for Telefónica España SIM via navigator.mozMobileConnection', function(done) {
    user.clear_settings();
    eq_(user.get_setting('carrier'), null);
    eq_(user.get_setting('region'), null);

    var navigator_ = {mozMobileConnection: {lastKnownNetwork: '214-005'}};
    user.detect_mobile_network(navigator_);

    eq_(user.get_setting('carrier'), 'telefonica');
    eq_(user.get_setting('region'), 'es');

    done();
});

test('region for unknown España SIM via navigator.mozMobileConnection', function(done) {
    user.clear_settings();
    eq_(user.get_setting('carrier'), null);
    eq_(user.get_setting('region'), null);

    var navigator_ = {mozMobileConnection: {lastKnownNetwork: '214-999'}};
    user.detect_mobile_network(navigator_);

    eq_(user.get_setting('carrier'), null);
    eq_(user.get_setting('region'), 'es');

    done();
});

})();
