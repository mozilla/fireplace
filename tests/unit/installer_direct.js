define('tests/unit/installer_direct',
    ['core/defer', 'installer_direct', 'tests/unit/helpers'],
    function(defer, installer_direct, h) {

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

    describe('installer_direct.install', function() {
        it('installs apps', function(done) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: false
            };
            installer_direct
                .install(product, {navigator: nav})
                .done(function() {
                    done();
                });

            nav.def.resolve({installState: 'installed'});
        });

        it('handles a delay', function(done) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: false
            };
            var result = {installState: 'pending'};

            installer_direct
                .install(product, {navigator: nav})
                .done(function() {
                    assert.equal(result.installState, 'installed');
                    done();
                });

            nav.def.resolve(result);
            setTimeout(function() {
                result.installState = 'installed';
            }, 400);
        });

        it('installs packaged apps', function(done) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: true
            };
            installer_direct
                .install(product, {navigator: nav})
                .done(function(_, installedProduct) {
                    assert.deepEqual(product, installedProduct);
                    done();
                });
            nav.def.resolve({installState: 'installed'});
        });

        it('can fail to install', function(done) {
            var nav = new MockNavigator();
            var product = {
                manifest_url: null,
                is_packaged: false
            };
            installer_direct
                .install(product, {navigator: nav})
                .done(function() {
                    done(new Error('install succeeded, should fail'));
                }).fail(function(error) {
                    done();
                });
            nav.def.reject();
        });

        it('can fail to install a package', function(done) {
            var nav = new MockNavigator(true);
            var product = {
                manifest_url: 'foo/bar',
                is_packaged: true
            };
            installer_direct
                .install(product, {navigator: nav})
                .done(function() {
                    done(new Error('install succeeded, should fail'));
                }).fail(function(error) {
                    done();
                });
            nav.def.reject();
        });
    });

    describe('installer_direct.getInstalled', function() {
        it('lists installs', function(done) {
            var nav = new MockNavigator();
            installer_direct
                .getInstalled({navigator: nav})
                .done(function(result) {
                    assert.equal(result.length, 1);
                    assert.equal(result[0], 'http://foo.manifest.url');
                    done();
                }).fail(function(error) {
                    done(new Error(error));
                });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([new MockApp('http://foo.manifest.url')]);
        });
    });

    describe('installer_direct.applyUpdate', function() {
        it('fails when not installed', function(done) {
            var nav = new MockNavigator();

            installer_direct.applyUpdate('http://bar.manifest.url', {
                navigator: nav
            }).done(function() {
                done(new Error('applyUpdate succeeded, should fail'));
            }).fail(function(result) {
                assert.equal(result, 'NOT_INSTALLED');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([new MockApp('http://foo.manifest.url')]);
        });

        it('fails when already downloading', function(done) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url');
            app.downloading = true;

            installer_direct.applyUpdate(app.manifestURL, {
                navigator: nav
            }).done(function() {
                done(new Error('applyUpdate succeeded, should fail'));
            }).fail(function(result) {
                assert.equal(result, 'APP_IS_DOWNLOADING');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
        });

        it('fails when download is not available', function(done) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url');
            app.downloadAvailable = false;

            installer_direct.applyUpdate(app.manifestURL, {
                navigator: nav
            }).done(function() {
                done(new Error('applyUpdate succeeded, should fail'));
            }).fail(function(result) {
                assert.equal(result, 'NO_DOWNLOAD_AVAILABLE');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
        });

        it('fails on a download error', function(done) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url', true);

            installer_direct.applyUpdate(app.manifestURL, {
                navigator: nav
            }).done(function() {
                done(new Error('applyUpdate succeeded, should fail'));
            }).fail(function(result) {
                assert.equal(result, 'Test Error');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
            // Reject the mocked download promise.
            app.def.reject();
        });

        it('succeeds when downloaded', function(done) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url', true);

            installer_direct.applyUpdate(app.manifestURL, {
                navigator: nav
            }).done(function() {
                done();
            }).fail(function() {
                done(new Error('applyUpdate failed, should pass'));
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
            // Resolve the mocked download promise.
            app.def.resolve();
        });
    });

    describe('installer_direct.checkForUpdate', function() {
        it('fails when not installed', function(done) {
            var nav = new MockNavigator();

            installer_direct.checkForUpdate('http://bar.manifest.url', {
                navigator: nav
            }).done(function() {
                done(new Error('checkForUpdate succeeded, should fail'));
            }).fail(function(result) {
                assert.equal(result, 'NOT_INSTALLED');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([new MockApp('http://foo.manifest.url')]);
        });

        it('fails when already downloading', function(done) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url');
            app.downloading = true;

            installer_direct.checkForUpdate(app.manifestURL, {
                navigator: nav
            }).done(function() {
                done(new Error('checkForUpdate succeeded, should fail'));
            }).fail(function(result) {
                assert.equal(result, 'APP_IS_DOWNLOADING');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
        });

        it('fails when download already available', function(done) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url');
            app.downloadAvailable = true;

            installer_direct.checkForUpdate(app.manifestURL, {
                navigator: nav
            }).done(function(result) {
                assert.equal(result, true);
                done();
            }).fail(function() {
                done(new Error('checkForUpdate failed, should pass'));
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
        });

        it('installer_direct.checkForUpdate error', function(done) {
            var nav = new MockNavigator();
            var app = new MockApp('http://foo.manifest.url');

            installer_direct.checkForUpdate(app.manifestURL, {
                navigator: nav
            }).done(function() {
                done(new Error('checkForUpdate passed, should fail'));
            }).fail(function(result) {
                assert.equal(result, 'Test Error');
                done();
            });

            // Resolve the mocked getInstalled promise.
            nav.def.resolve([app]);
            // Reject the mocked checkForUpdate promise.
            app.def.reject();
        });
    });
});
