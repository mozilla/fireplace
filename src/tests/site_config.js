(function() {
var a = require('assert');
var eq_ = a.eq_;
var contains = a.contains;
var mock = a.mock;
var defer = require('defer');
var urls = require('urls');

function mockSiteConfigRequestSuccess(data) {
    return function(args) {
        var def = defer.Deferred();
        def.args = args;
        def.resolve(data);
        return def;
    };
}

test('sets waffle switches', function(done, fail) {
    var settings = {
        api_cdn_whitelist: {},
        switches: []
    };
    mock(
        'site_config',
        {
            requests: {
                get: mockSiteConfigRequestSuccess({
                    waffle: {
                        switches: ['dummy-switch']
                    }
                }
            )},
            settings: settings,
        },
        function(siteConfig) {
            var promise = siteConfig.promise;
            promise.then(function() {
                eq_(settings.switches.length, 1);
                contains(settings.switches, 'dummy-switch');
                done();
            });
        },
        fail
    );
});

test('sets waffle switches object', function(done, fail) {
    var settings = {
        api_cdn_whitelist: {},
        switches: []
    };
    mock(
        'site_config',
        {
            requests: {
                get: mockSiteConfigRequestSuccess({
                    waffle: {
                        // Not an array, old-style response, will be ignored.
                        switches: {'dummy-switch': {'somedata': 1}}
                    }
                }
            )},
            settings: settings,
        },
        function(siteConfig) {
            var promise = siteConfig.promise;
            promise.then(function() {
                eq_(settings.switches.length, 0);
                done();
            });
        },
        fail
    );
});

test('sets fxa auth', function(done, fail) {
    var settings = {
        api_cdn_whitelist: {},
        switches: []
    };
    mock(
        'site_config',
        {
            requests: {
                get: mockSiteConfigRequestSuccess({
                    waffle: {
                        switches: ['dummy-switch']
                    },
                    fxa: {
                        fxa_auth_url: 'http://ngokevin.com',
                        fxa_auth_state: 'somemoreseolongtoken'
                    }
                }
            )},
            settings: settings,
        },
        function(siteConfig) {
            var promise = siteConfig.promise;
            promise.then(function() {
                eq_(settings.fxa_auth_url, 'http://ngokevin.com');
                eq_(settings.fxa_auth_state, 'somemoreseolongtoken');
                done();
            });
        },
        fail
    );
});

test('handles no fxa auth data', function(done, fail) {
    var settings = {
        api_cdn_whitelist: {},
        switches: []
    };
    mock(
        'site_config',
        {
            requests: {
                get: mockSiteConfigRequestSuccess({
                    waffle: {
                        switches: ['dummy-switch']
                    },
                })
            },
            settings: settings,
        },
        function(siteConfig) {
            var promise = siteConfig.promise;
            promise.then(function() {
                eq_(settings.fxa_auth_url, undefined);
                eq_(settings.fxa_auth_state, undefined);
                done();
            });
        },
        fail
    );
});

})();
