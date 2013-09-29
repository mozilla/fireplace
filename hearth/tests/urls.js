(function() {
var a = require('assert');
var assert = a.assert;
var eq_ = a.eq_;
var contains = a.contains;
var disincludes = a.disincludes;
var mock = a.mock;

var urls = require('urls');

function mock_routes(routes, runner, fail) {
    var temp = window.routes;
    window.routes = routes;
    try {
        runner();
    } catch(e) {
        fail(e);
    }
    window.routes = temp;
}

test('reverse', function(done, fail) {
    mock_routes([
        {pattern: '^/$', view_name: 'homepage'},
        {pattern: '^/app/(.+)$', view_name: 'app'}
    ], function() {
        var reverse = urls.reverse;
        eq_(reverse('homepage'), '/');
        eq_(reverse('app', ['slug']), '/app/slug');
        done();
    }, fail);
});

test('reverse missing args', function(done, fail) {
    mock_routes([
        {pattern: '^/$', view_name: 'homepage'},
        {pattern: '^/app/(.+)$', view_name: 'app'}
    ], function() {
        var reverse = urls.reverse;
        try {
            reverse('app', []);
        } catch(e) {
            return done();
        }
        fail('reverse() did not throw exception');
    }, fail);
});

test('reverse too many args', function(done, fail) {
    mock_routes([
        {pattern: '^/$', view_name: 'homepage'},
        {pattern: '^/app/(.+)$', view_name: 'app'}
    ], function() {
        var reverse = urls.reverse;
        try {
            reverse('app', ['foo', 'bar']);
        } catch(e) {
            return done();
        }
        fail('reverse() did not throw exception');
    }, fail);
});

test('api url', function(done, fail) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            routes_api: {'homepage': '/foo/homepage'},
            settings: {api_url: 'api:'}
        }, function(urls) {
            var homepage_url = urls.api.url('homepage');
            eq_(homepage_url.substr(0, 17), 'api:/foo/homepage');
            contains(homepage_url, 'dev=firefoxos');
            done();
        },
        fail
    );
});

test('api url signage', function(done, fail) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            routes_api: {'homepage': '/foo/homepage'},
            settings: {api_url: 'api:'}
        }, function(urls) {
            var homepage_url = urls.api.unsigned.url('homepage');
            eq_(homepage_url, 'api:/foo/homepage');
            eq_(urls.api.sign(homepage_url), urls.api.url('homepage'));
            done();
        },
        fail
    );
});

// TODO(commonplace): Deal with the next three tests (move them to mobilenetwork?)
test('api hardcoded carrier', function(done) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            settings: {api_url: 'api:', carrier: {slug: 'bastacom'}},
            user: {logged_in: function() {}, get_setting: function(x) { return x == 'carrier' && 'bastacom'; }}
        }, function(urls) {
            contains(urls.api.url('search'), 'carrier=bastacom');
            done();
        }
    );
});

test('api user-defined carrier (via SIM)', function(done) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            settings: {api_url: 'api:', carrier: {slug: 'bastacom'}},
            user: {logged_in: function() {}, get_setting: function(x) { return x == 'carrier' && 'seavanaquaticcorp'; }}
        }, function(urls) {
            contains(urls.api.url('search'), 'carrier=seavanaquaticcorp');
            done();
        }
    );
});

test('api user-defined carrier+region (via SIM)', function(done) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            settings: {api_url: 'api:', carrier: {slug: 'bastacom'}},
            user: {
                logged_in: function() {},
                get_setting: function(x) {
                    switch(x) {
                        case 'carrier':
                            return 'seavanaquaticcorp';
                        case 'region':
                            return 'underwater';
                    }
                }
            }
        }, function(urls) {
            var url = urls.api.url('search');
            contains(url, 'carrier=seavanaquaticcorp');
            contains(url, 'region=underwater');
            done();
        }
    );
});

test('api url blacklist', function(done, fail) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            routes_api: {'homepage': '/foo/homepage'},
            settings: {api_url: 'api:', api_param_blacklist: ['region']}
        }, function(urls) {
            var homepage_url = urls.api.url('homepage');
            eq_(homepage_url.substr(0, 17), 'api:/foo/homepage');
            disincludes(homepage_url, 'region=');
            done();
        },
        fail
    );
});

test('api url params', function(done, fail) {
    mock(
        'urls',
        {
            routes_api: {'homepage': '/foo/asdf'},
            settings: {api_url: 'api:'}
        }, function(urls) {
            var homepage_url = urls.api.params('homepage', {q: 'poop'});
            eq_(homepage_url.substr(0, 13), 'api:/foo/asdf');
            contains(homepage_url, 'q=poop');
            done();
        },
        fail
    );
});

})();
