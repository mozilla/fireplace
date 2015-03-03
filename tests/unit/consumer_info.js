define('tests/unit/consumer_info',
    ['core/defer', 'tests/unit/helpers'],
    function(defer, h) {

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

    function noMobilenetwork(injector) {
        injector.mock('mobilenetwork', {});
    }

    function mockConsumerInfoSuccess(response) {
        return function(injector) {
            injector.mock('core/requests', {
                get: mockConsumerInfoRequestSuccess(response),
            });
        };
    }

    function mockConsumerInfoFailed(response) {
        return function(injector) {
            injector.mock('core/requests', {
                get: mockConsumerInfoRequestFailure(response),
            });
        };
    }

    function mockLoggedOut(injector) {
        injector.mock('core/user', {logged_in: function() { return false; }});
    }

    describe('consumer_info', function() {
        var geoip_region;

        this.beforeEach(function() {
            geoip_region = null;
        });

        it('automatically sets region when required', function(done) {
            h.injector(
                noMobilenetwork,
                mockConsumerInfoSuccess({region: 'nowhere'}),
                mockLoggedOut,
                h.mockSettings({api_cdn_whitelist: {}})
            ).mock('user_helpers', {
                region: function(x, y) { return ''; },
                carrier: function() { return ''; },
                set_region_geoip: function(r) { geoip_region = r; }
            }).require(['consumer_info'], function(consumer_info) {
                var promise = consumer_info.promise;
                promise.then(function() {
                    assert.equal(geoip_region, 'nowhere');
                    done();
                });
            });
        });

        it('automatically does not reset region if already present', function(done) {
            h.injector(
                noMobilenetwork,
                mockConsumerInfoSuccess({region: 'nowhere'}),
                mockLoggedOut,
                h.mockSettings({api_cdn_whitelist: {}})
            ).mock('user_helpers', {
                region: function(x, y) { return 'previous_region'; },
                carrier: function() { return ''; },
                set_region_geoip: function(r) { geoip_region = r; },
            }).require(['consumer_info'], function(consumer_info) {
                var promise = consumer_info.promise;
                promise.then(function() {
                    // We already had a region, we shouldn't have reset it.
                    assert.equal(geoip_region, null);
                    done();
                });
            });
        });

        it('automatically sets region to restofworld if API call fails', function(done) {
            h.injector(
                noMobilenetwork,
                mockConsumerInfoFailed(),
                mockLoggedOut,
                h.mockSettings({api_cdn_whitelist: {}})
            ).mock('user_helpers', {
                region: function(x, y) { return ''; },
                carrier: function() { return ''; },
                set_region_geoip: function(r) { geoip_region = r; }
            }).require(['consumer_info'], function(consumer_info) {
                var promise = consumer_info.promise;
                promise.then(function() {
                    assert.equal(geoip_region, 'restofworld');
                    done();
                });
            });
        });

        it('API is not called if unnecessary', function(done) {
            h.injector(
                noMobilenetwork,
                mockLoggedOut,
                h.mockSettings({api_cdn_whitelist: {}})
            ).mock('core/requests', {
                get: function(url) {
                    throw new Error('requests.get was called');
                },
            }).mock('user_helpers', {
                region: function(x, y) { return 'fr'; },
                carrier: function() { return ''; },
                set_region_geoip: function() {
                    throw new Error(
                        'user_helpers.set_region_geoip was called');
                },
            }).require(['consumer_info'], function(consumer_info) {
                consumer_info.promise.then(function() {
                    done();
                });
            });
        });

        it('does not call the API if region is present in the body', function(done) {
            h.injector(
                noMobilenetwork,
                mockLoggedOut,
                h.mockSettings({api_cdn_whitelist: {}})
            ).mock('core/requests', {
                get: function(url) {
                    throw new Error('requests.get was called');
                }
            }).mock('user_helpers', {
                region: function(x, y) { return ''; },
                carrier: function() { return ''; },
                set_region_geoip: function(r) { geoip_region = r; }
            }).mock('core/z', {
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
            }).require(['consumer_info'], function(consumer_info) {
                consumer_info.promise.then(function() {
                    assert.equal(geoip_region, 'es');
                    done();
                });
            });
        });

        it('calls the API if user is logged in', function(done) {
            var apps = {
                developed: [41, 42],
                installed: [43, 44, 45],
                purchased: [46, 47, 48, 49]
            };
            h.injector(
                noMobilenetwork,
                mockConsumerInfoSuccess({
                    region: 'faraway',
                    enable_recommendations: true,
                    apps: apps,
                }),
                h.mockSettings({api_cdn_whitelist: {}})
            ).mock('core/user', {
                get_token: function() { return 'faketoken'; },
                logged_in: function() { return true; },
                update_settings: function(settings) {
                    assert.equal(settings.enable_recommendations, true);
                },
                update_apps: function(incoming_apps) {
                    assert.equal(incoming_apps.developed, apps.developed);
                    assert.equal(incoming_apps.installed, apps.installed);
                    assert.equal(incoming_apps.purchased, apps.purchased);
                }
            }).mock('user_helpers', {
                region: function(x, y) { return 'fr'; },
                carrier: function() { return ''; },
                set_region_geoip: function() {
                    throw new Error(
                        'user_helpers.set_region_geoip was called');
                },
            }).require(['consumer_info'], function(consumer_info) {
                consumer_info.promise.then(function() {
                    done();
                });
            });
        });
    });
});
