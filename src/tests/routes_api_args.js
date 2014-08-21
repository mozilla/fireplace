(function() {
var a = require('assert');
var assert = a.assert;
var eq_ = a.eq_;
var mock = a.mock;

test('base api arguments mobile', function(done, fail) {
    mock(
        'routes_api_args',
        {
            buckets: {profile: 'testprofile'},
            capabilities: {firefoxOS: true},
            user_helpers: {
                carrier: function() {
                    return 'testcarrier';
                },
                region: function(x, ignore_stored_geoip) {
                    if (!ignore_stored_geoip) {
                        fail('routes_api_args tried to use the geoip region stored in settings.');
                    }
                    return 'testregion';
                }
            }
        }, function(routes_api_args) {
            var args = routes_api_args();
            assert(args.lang);
            eq_(args.carrier, 'testcarrier');
            eq_(args.region, 'testregion');
            eq_(args.dev, 'firefoxos');
            eq_(args.device, 'firefoxos');
            eq_(args.limit, 10);
            eq_(args.pro, 'testprofile');
            done();
        },
        fail
    );
});

test('base api arguments android', function(done, fail) {
    mock(
        'routes_api_args',
        {
            buckets: {profile: 'testprofileandroid'},
            capabilities: {firefoxOS: false, firefoxAndroid: true, widescreen: function() { return false; }},
            user_helpers: {
                carrier: function() {
                    return '';
                },
                region: function(x, ignore_stored_geoip) {
                    if (!ignore_stored_geoip) {
                        fail('routes_api_args tried to use the geoip region stored in settings.');
                    }
                    return 'testregion';
                }
            }
        }, function(routes_api_args) {
            var args = routes_api_args();
            assert(args.lang);
            eq_(args.carrier, '');
            eq_(args.region, 'testregion');
            eq_(args.dev, 'android');
            eq_(args.device, 'mobile');
            eq_(args.limit, 10);
            eq_(args.pro, 'testprofileandroid');
            done();
        },
        fail
    );
});

test('base api arguments android tablet', function(done, fail) {
    mock(
        'routes_api_args',
        {
            buckets: {profile: 'testprofileandroidtablet'},
            capabilities: {firefoxOS: false, firefoxAndroid: true,  widescreen: function() { return true; }},
            user_helpers: {
                carrier: function() {
                    return '';
                },
                region: function(x, ignore_stored_geoip) {
                    if (!ignore_stored_geoip) {
                        fail('routes_api_args tried to use the geoip region stored in settings.');
                    }
                    return 'testregion';
                }
            }
        }, function(routes_api_args) {
            var args = routes_api_args();
            assert(args.lang);
            eq_(args.carrier, '');
            eq_(args.region, 'testregion');
            eq_(args.dev, 'android');
            eq_(args.device, 'tablet');
            eq_(args.limit, 25);
            eq_(args.pro, 'testprofileandroidtablet');
            done();
        },
        fail
    );
});

test('base api arguments desktop', function(done, fail) {
    mock(
        'routes_api_args',
        {
            buckets: {profile: 'testprofiledesktop'},
            capabilities: {firefoxOS: false, firefoxAndroid: false},
            user_helpers: {
                carrier: function() {
                    return '';
                },
                region: function(x, ignore_stored_geoip) {
                    if (!ignore_stored_geoip) {
                        fail('routes_api_args tried to use the geoip region stored in settings.');
                    }
                    return 'testregion';
                }
            }
        }, function(routes_api_args) {
            var args = routes_api_args();
            assert(args.lang);
            eq_(args.carrier, '');
            eq_(args.region, 'testregion');
            eq_(args.dev, 'desktop');
            eq_(args.device, 'desktop');
            eq_(args.limit, 25);
            eq_(args.pro, 'testprofiledesktop');
            done();
        },
        fail
    );
});

})();
