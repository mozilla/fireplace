(function() {
var a = require('assert');
var eq_ = a.eq_;
var contains = a.contains;
var mock = a.mock;
var defer = require('defer');
var urls = require('urls');

function mockConsumerInfoRequestSuccess(data) {
    return function(args) {
        var def = defer.Deferred();
        def.args = args;
        def.resolve(data);
        return def;
    };
}

function mockConsumerInfoRequestFailure(data) {
    return function(args) {
        var def = defer.Deferred();
        def.args = args;
        def.reject();
        return def;
    };
}

xtest('consumer_info automatically set region when required', function(done, fail) {
    var geoip_region = null;
    var settings = {
        api_cdn_whitelist: {}
    };
    mock(
        'consumer_info',
        {
            mobilenetwork: {},
            requests: {
                get: mockConsumerInfoRequestSuccess({
                    region: 'nowhere',
                }
            )},
            user: {logged_in: function() { return false; }},
            settings: settings,
            user_helpers: {
                region: function(x, y) { return ''; },
                carrier: function() { return ''; },
                set_region_geoip: function(r) { geoip_region = r; }
            }
        },
        function(consumer_info) {
            var promise = consumer_info.promise;
            promise.then(function() {
                eq_(geoip_region, 'nowhere');
                done();
            });
        },
        fail
    );
});

test('consumer_info automatically does not reset region if already present', function(done, fail) {
    var geoip_region = null;
    var settings = {
        api_cdn_whitelist: {}
    };
    mock(
        'consumer_info',
        {
            mobilenetwork: {},
            requests: {get: mockConsumerInfoRequestSuccess({region: 'nowhere'})},
            user: {logged_in: function() { return false; }},
            settings: settings,
            user_helpers: {
                region: function(x, y) { return 'previous_region'; },
                carrier: function() { return ''; },
                set_region_geoip: function(r) { geoip_region = r; }
            }
        },
        function(consumer_info) {
            var promise = consumer_info.promise;
            promise.then(function() {
                // We already had a region, we shouldn't have reset it.
                eq_(geoip_region, null);
                done();
            });
        },
        fail
    );
});

xtest('consumer_info automatically sets region to restofworld if API call fails', function(done, fail) {
    var geoip_region = null;
    var settings = {
        api_cdn_whitelist: {}
    };
    mock(
        'consumer_info',
        {
            mobilenetwork: {},
            requests: {get: mockConsumerInfoRequestFailure()},
            settings: settings,
            user_helpers: {
                region: function(x, y) { return ''; },
                carrier: function() { return ''; },
                set_region_geoip: function(r) { geoip_region = r; }
            }
        },
        function(consumer_info) {
            var promise = consumer_info.promise;
            promise.then(function() {
                eq_(geoip_region, 'restofworld');
                done();
            });
        },
        fail
    );
});

test('consumer_info API is not called if unnecessary', function(done, fail) {
    var geoip_region = null;
    var settings = {
        api_cdn_whitelist: {}
    };
    mock(
        'consumer_info',
        {
            mobilenetwork: {},
            requests: {get: function(url) { fail('We tried to make a request to ' + url); return defer.Deferred(); }},
            settings: settings,
            user: {logged_in: function() { return false; }},
            user_helpers: {
                region: function(x, y) { return 'fr'; },
                carrier: function() { return ''; },
                set_region_geoip: function() { fail(); }
            }
        },
        function(consumer_info) {
            consumer_info.promise.then(function() {
                done();
            });
        },
        fail
    );
});

test('consumer_info API is not called if region is present in the body', function(done, fail) {
    var geoip_region = null;
    var settings = {
        api_cdn_whitelist: {}
    };
    mock(
        'consumer_info',
        {
            mobilenetwork: {},
            requests: {get: function(url) { fail('We tried to make a request to ' + url); return defer.Deferred(); }},
            settings: settings,
            user: {logged_in: function() { return false; }},
            user_helpers: {
                region: function(x, y) { return ''; },
                carrier: function() { return ''; },
                set_region_geoip: function(r) { geoip_region = r; }
            },
            z: {
                body: {
                    data: function(key) {
                        if (key == 'region') {
                            return 'es';
                        }
                    },
                },
                win: {
                    on: function() {}
                }
            }
        },
        function(consumer_info) {
            consumer_info.promise.then(function() {
                done();
                eq_(geoip_region, 'es');
            });
        },
        fail
    );
});

xtest('consumer_info API is called if user is logged in', function(done, fail) {
    var geoip_region = null;
    var settings = {
        api_cdn_whitelist: {}
    };
    var apps = {
        developed: [41, 42],
        installed: [43, 44, 45],
        purchased: [46, 47, 48, 49]
    };
    mock(
        'consumer_info',
        {
            mobilenetwork: {},
            requests: {
                get: mockConsumerInfoRequestSuccess({
                    region: 'faraway',
                    enable_recommendations: true,
                    apps: apps
                }
            )},
            settings: settings,
            user: {
                get_token: function() { return 'faketoken'; },
                logged_in: function() { return true; },
                update_settings: function(settings) {
                    eq_(settings.enable_recommendations, true);
                },
                update_apps: function(incoming_apps) {
                    eq_(incoming_apps.developed, apps.developed);
                    eq_(incoming_apps.installed, apps.installed);
                    eq_(incoming_apps.purchased, apps.purchased);
                }
            },
            user_helpers: {
                region: function(x, y) { return 'fr'; },
                carrier: function() { return ''; },
                set_region_geoip: function() { fail(); }  // We already had a region.
            }
        },
        function(consumer_info) {
            consumer_info.promise.then(function() {
                done();
            });
        },
        fail
    );
});

})();
