(function() {
var a = require('assert');
var assert = a.assert;
var eq_ = a.eq_;
var contains = a.contains;
var mock = a.mock;
var defer = require('defer');

function MockNavigator(no_package) {
    var def = this.def = defer.Deferred();
    function installer(url, data) {
        var robj = {
            result: null
        };
        def.done(function(result) {
            robj.result = result;
            if (robj.onsuccess) {
                robj.onsuccess.apply(this);
            }
        }).fail(function(result) {
            robj.result = result;
            this.error = {name: 'Test Error'};
            if (robj.onerror) {
                robj.onerror.apply(this);
            }
        });
        return robj;
    }
    this.mozApps = {
        install: installer,
        installPackage: installer
    };
    if (no_package) {
        this.mozApps.installPackage = undefined;
    }
}

test('apps.install', function(done, fail) {
    mock(
        'apps',
        {defer: defer},
        function(apps) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: false
            };
            apps.install(product, {navigator: nav}).done(done);

            nav.def.resolve({installState: 'installed'});
        }
    );
});

test('apps.install delay', function(done, fail) {
    mock(
        'apps',
        {defer: defer},
        function(apps) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: false
            };
            apps.install(product, {navigator: nav}).done(done);

            var result = {installState: 'pending'};
            nav.def.resolve(result);
            setTimeout(function() {
                result.installState = 'installed';
            }, 400);
        }
    );
});

test('apps.install packaged', function(done, fail) {
    mock(
        'apps',
        {defer: defer},
        function(apps) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: true
            };
            apps.install(product, {navigator: nav}).done(done);
            nav.def.resolve({installState: 'installed'});
        }
    );
});

test('apps.install unable', function(done, fail) {
    mock(
        'apps',
        {defer: defer},
        function(apps) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: null,
                is_packaged: false
            };
            apps.install(product, {navigator: nav}).done(fail).fail(done);
            // This shouldn't ever be used, but if it is, it'll trigger a failure.
            nav.def.resolve({installState: 'installed'});
        }
    );
});

test('apps.install unable packaged', function(done, fail) {
    mock(
        'apps',
        {defer: defer},
        function(apps) {
            var nav = new MockNavigator(true);
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: true
            };
            apps.install(product, {navigator: nav}).done(fail).fail(done);
            // This shouldn't ever be used, but if it is, it'll trigger a failure.
            nav.def.resolve({installState: 'installed'});
        }
    );
});

test('apps.install fail', function(done, fail) {
    mock(
        'apps',
        {defer: defer},
        function(apps) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: false
            };
            apps.install(product, {navigator: nav}).fail(done).done(fail);

            nav.def.reject({});
        }
    );
});


test('apps.incompat fine', function(done, fail) {
    mock(
        'apps',
        {
            capabilities: {
                device_type: function() {return 'foo';},
                webApps: true
            }
        },
        function(apps) {
            var product = {
                payment_required: false,
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(!results);
            done();
        }
    );
});


test('apps.incompat caching', function(done, fail) {
    mock(
        'apps',
        {
            capabilities: {
                device_type: function() {return 'foo';},
                webApps: true
            }
        },
        function(apps) {
            var product = {
                payment_required: false,
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(!results);
            assert('__compat_reasons' in product);
            product.__compat_reasons = 'asdf';
            eq_(apps.incompat(product), 'asdf');
            done();
        }
    );
});


test('apps.incompat payments', function(done, fail) {
    mock(
        'apps',
        {
            capabilities: {
                device_type: function() {return 'foo';},
                webApps: true,
                navPay: false
            },
            settings: {simulate_nav_pay: false}
        },
        function(apps) {
            var product = {
                payment_required: true,
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(results);
            eq_(results.length, 1);
            eq_(results[0], 'Your device does not support payments.');
            done();
        }
    );
});


test('apps.incompat webapps', function(done, fail) {
    mock(
        'apps',
        {
            capabilities: {
                device_type: function() {return 'foo';},
                webApps: false,
                navPay: true
            }
        },
        function(apps) {
            var product = {
                payment_required: true,
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(results);
            eq_(results.length, 2, results);
            eq_(results[1], 'Your browser or device is not web-app compatible.');
            done();
        },
        fail
    );
});


test('apps.incompat platform', function(done, fail) {
    mock(
        'apps',
        {
            capabilities: {
                device_type: function() {return 'foo';},
                webApps: true,
                navPay: true
            }
        },
        function(apps) {
            var product = {
                payment_required: true,
                device_types: ['bar']
            };
            var results = apps.incompat(product);
            assert(results);
            eq_(results.length, 2, results);
            eq_(results[1], 'This app is unavailable for your platform.');
            done();
        },
        fail
    );
});


test('apps.incompat platform and webapps', function(done, fail) {
    mock(
        'apps',
        {
            capabilities: {
                device_type: function() {return 'foo';},
                webApps: false,
                navPay: true
            }
        },
        function(apps) {
            var product = {
                payment_required: true,
                device_types: ['bar']
            };
            var results = apps.incompat(product);
            assert(results);

            // Only return the first one. Both don't make sense.
            eq_(results.length, 2, results);
            eq_(results[1], 'Your browser or device is not web-app compatible.');
            done();
        },
        fail
    );
});

})();
