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
    eq_(network.carrier, 'telefonica');  // Because Telefonica is the only carrier in Spain.
    done();
});

test('yes MCC, no MNC, not exclusive', function(done, fail) {
    var network = mobilenetwork.getNetwork('334', '');
    eq_(network.region, 'mx');
    eq_(network.carrier, null);  // Because there are multiple carriers in Mexico.
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
    eq_(user.get_setting('carrier_sim'), null);
    eq_(user.get_setting('region_sim'), null);

    var navigator_ = {mozMobileConnection: null};
    mobilenetwork.detectMobileNetwork(navigator_);

    eq_(user.get_setting('carrier_sim'), null);
    eq_(user.get_setting('region_sim'), null);

    done();
});

test('carrier+region for Telefónica España SIM via querystring', function(done, fail) {
    var updated = false;
    mock(
        'mobilenetwork',
        {
            user: {
                get_setting: function() { return null; },
                get_settings: function() { return {}; },
                update_settings: function(data) {
                    assert('region_sim' in data);
                    assert('carrier_sim' in data);
                    eq_(data.region_sim, 'es');
                    eq_(data.carrier_sim, 'telefonica');
                    updated = true;
                }
            },
            utils: {
                getVars: function() { return {mcc: '214', mnc: '005'}; }
            }
        }, function(mobilenetwork) {
            mobilenetwork.detectMobileNetwork({});
            (updated ? done : fail)();
        },
        fail
    );
});

test('carrier+region for Telefónica España SIM via navigator.mozMobileConnection', function(done) {
    user.clear_settings();

    var navigator_ = {mozMobileConnection: {lastKnownNetwork: '214-005'}};
    mobilenetwork.detectMobileNetwork(navigator_);

    eq_(user.get_setting('carrier_sim'), 'telefonica');
    eq_(user.get_setting('region_sim'), 'es');

    done();
});

test('api user-defined carrier (via SIM)', function(done, fail) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            user: {logged_in: function() {}, get_setting: function(x) {
                return x == 'carrier_sim' && 'seavanaquaticcorp';
            }}
        }, function(urls) {
            contains(urls.api.url('search'), 'carrier=seavanaquaticcorp');
            done();
        },
        fail
    );
});

test('api user-defined carrier+region (via SIM)', function(done, fail) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            user: {
                logged_in: function() {},
                get_setting: function(x) {
                    switch(x) {
                        case 'carrier_sim':
                            return 'seavanaquaticcorp';
                        case 'region_sim':
                            return 'underwater';
                    }
                }
            }
        }, function(urls) {
            var url = urls.api.url('search');
            contains(url, 'carrier=seavanaquaticcorp');
            contains(url, 'region=underwater');
            done();
        },
        fail
    );
});

})();
