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

})();
