(function() {
var a = require('assert');
var eq_ = a.eq_;
var contains = a.contains;
var mock = a.mock;
var defer = require('defer');
var urls = require('urls');

function mockWaffleRequestSuccess(data) {
    return function(args) {
        var def = defer.Deferred();
        def.args = args;
        def.resolve(data);
        return def;
    };
}

test('waffles sets switches', function(done, fail) {
    var settings = {
        api_cdn_whitelist: {}
    };
    mock(
        'waffles',
        {
            requests: {
                get: mockWaffleRequestSuccess({
                    switches: ['dummy-switch']
                }
            )},
            settings: settings,
        },
        function(waffles) {
            var promise = waffles.promise;
            promise.then(function() {
                eq_(settings.switches.length, 1);
                contains(settings.switches, 'dummy-switch');
                done();
            });
        },
        fail
    );
});
})();
