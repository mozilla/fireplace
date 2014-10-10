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
        api_cdn_whitelist: {}
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

test('sets fxa auth', function(done, fail) {
    var settings = {
        api_cdn_whitelist: {}
    };
    mock(
        'site_config',
        {
            requests: {
                get: mockSiteConfigRequestSuccess({
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
})();
