(function() {
var a = require('assert');
var assert = a.assert;
var eq_ = a.eq_;
var eeq = a.eeq_;
var contains = a.contains;
var mock = a.mock;
var defer = require('defer');

function MockNavigator(no_package) {
    var def = this.def = defer.Deferred();
    function mockMethod(url, data) {
        var robj = {
            result: null
        };
        def.done(function(result) {
            robj.result = result;
            if (robj.onsuccess) {
                robj.onsuccess.call(robj);
            }
        }).fail(function(result) {
            robj.result = result;
            robj.error = {name: 'Test Error'};
            if (robj.onerror) {
                robj.onerror.call(robj);
            }
        });
        return robj;
    }
    this.mozApps = {
        install: mockMethod,
        installPackage: mockMethod,
        getInstalled: mockMethod
    };
    if (no_package) {
        this.mozApps.installPackage = undefined;
    }
}


function MockApp(manifestURL, downloadAvailable) {
    var def = this.def = defer.Deferred();
    this.manifestURL = manifestURL;
    this.downloadAvailable = downloadAvailable;
    var app = this;

    function mockMethod() {
        var robj = {
            result: null
        };
        def.done(function(result, downloadAvailable) {
            robj.result = result;
            app.downloadAvailable = downloadAvailable;
            if (robj.onsuccess) {
                robj.onsuccess.call(robj);
            }
            if (app.ondownloadsuccess) {
                app.ondownloadsuccess.call(robj);
            }
        }).fail(function(result) {
            robj.result = result;
            robj.error = {name: 'Test Error'};
            if (robj.onerror) {
                robj.onerror.call(robj);
            }
            if (app.ondownloaderror) {
                // ondownloaderror is a litte tricky, it does not provides a
                // .error property, instead we look for the error name in
                // e.application.downloadError.name, so mock that.
                app.ondownloaderror.call(app, {
                    application: {
                        downloadError: {
                            name: 'Test Error'
                        }
                    }
                });
            }
        });
        return robj;
    }
    this.checkForUpdate = mockMethod;
    this.download = mockMethod;
}

test('installer_direct.install', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: false
            };
            installer_direct.install(product, {navigator: nav}).done(done);

            nav.def.resolve({installState: 'installed'});
        },
        fail
    );
});

test('installer_direct.install delay', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: false
            };
            installer_direct.install(product, {navigator: nav}).done(done);

            var result = {installState: 'pending'};
            nav.def.resolve(result);
            setTimeout(function() {
                result.installState = 'installed';
            }, 400);
        },
        fail
    );
});

test('installer_direct.install packaged', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: true
            };
            installer_direct.install(product, {navigator: nav}).done(done);
            nav.def.resolve({installState: 'installed'});
        },
        fail
    );
});

test('installer_direct.install unable', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: null,
                is_packaged: false
            };
            installer_direct.install(product, {navigator: nav}).done(fail).fail(done);
            nav.def.reject();
        },
        fail
    );
});

test('installer_direct.install unable packaged', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator(true);
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: true
            };
            installer_direct.install(product, {navigator: nav}).done(fail).fail(done);
            nav.def.reject();
        },
        fail
    );
});

test('installer_direct.install fail', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: false
            };
            installer_direct.install(product, {navigator: nav}).fail(done).done(fail);

            nav.def.reject({});
        },
        fail
    );
});

test('installer_direct.getInstalled', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();
            installer_direct.getInstalled({navigator: nav}).done(function(result) {
                eq_(result.length, 1);
                eq_(result[0], 'http://foo.manifest.url');
                done();
            }).fail(fail);

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([new MockApp('http://foo.manifest.url')]);
        },
        fail
    );
});

test('installer_direct.applyUpdate not installed', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();

            installer_direct.applyUpdate('http://bar.manifest.url', {
                navigator: nav
            }).done(fail).fail(function(result) {
                eq_(result, 'NOT_INSTALLED');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([new MockApp('http://foo.manifest.url')]);
        },
        fail
    );
});

test('installer_direct.applyUpdate already downloading', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url');
            app.downloading = true;

            installer_direct.applyUpdate(app.manifestURL, {
                navigator: nav
            }).done(fail).fail(function(result) {
                eq_(result, 'APP_IS_DOWNLOADING');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
        },
        fail
    );
});


test('installer_direct.applyUpdate download not available', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url');
            app.downloadAvailable = false;

            installer_direct.applyUpdate(app.manifestURL, {
                navigator: nav
            }).done(fail).fail(function(result) {
                eq_(result, 'NO_DOWNLOAD_AVAILABLE');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
        },
        fail
    );
});

test('installer_direct.applyUpdate download error', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url', true);

            installer_direct.applyUpdate(app.manifestURL, {
                navigator: nav
            }).done(fail).fail(function(result) {
                eq_(result, 'Test Error');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
            // Reject the mocked download promise.
            app.def.reject();
        },
        fail
    );
});

test('installer_direct.applyUpdate download', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url', true);

            installer_direct.applyUpdate(app.manifestURL, {
                navigator: nav
            }).done(done).fail(fail);

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
            // Resolve the mocked download promise.
            app.def.resolve();
        },
        fail
    );
});

test('installer_direct.checkForUpdate not installed', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();

            installer_direct.checkForUpdate('http://bar.manifest.url', {
                navigator: nav
            }).done(fail).fail(function(result) {
                eq_(result, 'NOT_INSTALLED');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([new MockApp('http://foo.manifest.url')]);
        },
        fail
    );
});

test('installer_direct.checkForUpdate already downloading', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url');
            app.downloading = true;

            installer_direct.checkForUpdate(app.manifestURL, {
                navigator: nav
            }).done(fail).fail(function(result) {
                eq_(result, 'APP_IS_DOWNLOADING');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
        },
        fail
    );
});

test('installer_direct.checkForUpdate download already available', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url');
            app.downloadAvailable = true;

            installer_direct.checkForUpdate(app.manifestURL, {
                navigator: nav
            }).done(function(result) {
                eq_(result, true);
                done();
            }).fail(fail);

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
        },
        fail
    );
});

test('installer_direct.checkForUpdate error', function(done, fail) {
    mock(
        'installer_direct',
        {defer: defer},
        function(installer_direct) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url');

            installer_direct.checkForUpdate(app.manifestURL, {
                navigator: nav
            }).done(fail).fail(function(result) {
                eq_(result, 'Test Error');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
            // Reject the mocked checkForUpdate promise.
            app.def.reject();
        },
        fail
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
        },
        fail
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
        },
        fail
    );
});


test('apps.incompat payments', function(done, fail) {
    mock(
        'apps',
        {
            capabilities: {
                device_type: function() {return 'foo';},
                webApps: true,
            },
            settings: {}
        },
        function(apps) {
            var product = {
                payment_required: true,
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(results);
            eq_(results.length, 1);
            eq_(results[0], 'This app is unavailable for purchase in your region.');
            done();
        },
        fail
    );
});


test('apps.incompat webapps', function(done, fail) {
    mock(
        'apps',
        {
            capabilities: {
                device_type: function() {return 'foo';},
                webApps: false,
            }
        },
        function(apps) {
            var product = {
                payment_required: true,
                price: '1.00',
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(results);
            eq_(results.length, 1);
            eq_(results[0], 'Your browser or device is not web-app compatible.');
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
            }
        },
        function(apps) {
            var product = {
                payment_required: true,
                price: '1.00',
                device_types: ['bar']
            };
            var results = apps.incompat(product);
            assert(results);
            eq_(results.length, 1);
            eq_(results[0], 'This app is unavailable for your platform.');
            done();
        },
        fail
    );
});


test('apps.incompat payments unavailable', function(done, fail) {
    mock(
        'apps',
        {
            capabilities: {
                device_type: function() {return 'foo';},
                webApps: true,
            }
        },
        function(apps) {
            var product = {
                payment_required: true,
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(results);
            eq_(results.length, 1);
            eq_(results[0], 'This app is unavailable for purchase in your region.');
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
            }
        },
        function(apps) {
            var product = {
                payment_required: true,
                price: '1.00',
                device_types: ['bar']
            };
            var results = apps.incompat(product);
            assert(results);

            // Only return the first one. Both don't make sense.
            eq_(results.length, 1);
            eq_(results[0], 'Your browser or device is not web-app compatible.');
            done();
        },
        fail
    );
});

})();
