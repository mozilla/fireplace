define('tests/unit/compat_filter',
    ['tests/unit/helpers'],
    function(helpers) {

    var TEST_ENDPOINTS = [
        'app', 'category', 'recommended', 'installed', 'search'
    ];

    function testApiArgs(compatFilter, expectedArgs) {
        TEST_ENDPOINTS.forEach(function(endpoint) {
            var args = compatFilter.apiArgs(endpoint);
            assert.equal(args.dev, expectedArgs.dev, 'dev');
            assert.equal(args.device, expectedArgs.device, 'device');
            assert.equal(args.limit, expectedArgs.limit, 'limit');
            assert.equal(args.pro, expectedArgs.pro, 'pro');
        });
    }

    function noStorage(injector) {
        return injector.mock('core/storage', {
            getItem: function() { return null; },
            setItem: function() { return null; },
        });
    }

    function noUtilsVars(injector) {
        return injector.mock('core/utils', {
            encodeURIComponent: function() { return ''; },
            getVars: function() { return {}; },
        });
    }

    function desktopCapabilities(injector) {
        return injector.mock('core/capabilities', {
            device_platform: function() { return 'desktop'; },
            device_formfactor: function() { return ''; },
            device_type: function() { return 'desktop'; },
        });
    }

    function androidCapabilities(format) {
        return function(injector) {
            return injector.mock('core/capabilities', {
                device_platform: function() { return 'android'; },
                device_formfactor: function() { return format; },
                device_type: function() { return 'android-' + format; },
                firefoxAndroid: true
            });
        };
    }

    function firefoxOSCapabilities(injector) {
        return injector.mock('core/capabilities', {
            device_platform: function() { return 'firefoxos'; },
            device_formfactor: function() { return ''; },
            device_type: function() { return 'firefoxos'; },
            firefoxOS: true
        });
    }

    describe('compat_filter', function() {
        it('set device to desktop',
            helpers
            .injector(desktopCapabilities, noStorage, noUtilsVars)
            .run(['compat_filter'], function(compatFilter) {
                testApiArgs(compatFilter, {
                    dev: 'desktop',
                    device: '',
                    limit: 24,
                    pro: undefined
                });
                assert.equal(compatFilter.isDeviceSelected('desktop'), true);
            }));

        it('set device to android mobile',
            helpers
            .injector(androidCapabilities('mobile'))
            .run(['compat_filter'], function(compatFilter) {
                testApiArgs(compatFilter, {
                    dev: 'android',
                    device: 'mobile',
                    limit: '10',
                    pro: undefined
                });
                assert.equal(compatFilter.isDeviceSelected('android-mobile'), true);
                assert.equal(compatFilter.getFilterDevice(), 'android-mobile');
            }));

        it('set device android tablet',
            helpers
            .injector(androidCapabilities('tablet'))
            .run(['compat_filter'], function(compatFilter) {
                testApiArgs(compatFilter, {
                    dev: 'android',
                    device: 'tablet',
                    limit: '24',
                    pro: undefined
                });
                assert.equal(compatFilter.isDeviceSelected('android-tablet'), true);
                assert.equal(compatFilter.getFilterDevice(), 'android-tablet');
            }));

        it('set device to firefoxos',
            helpers
            .injector(firefoxOSCapabilities, noStorage)
            .run(['compat_filter'], function(compatFilter) {
                testApiArgs(compatFilter, {
                    dev: 'firefoxos',
                    device: '',
                    limit: '10',
                    pro: compatFilter.featureProfile
                });
                assert.equal(compatFilter.isDeviceSelected('firefoxos'), true);
                assert.equal(compatFilter.getFilterDevice(), 'firefoxos');
            }));

        it('set feature profiles',
            helpers
            .injector(firefoxOSCapabilities, noStorage, noUtilsVars)
            .mock('core/utils', {
                encodeURIComponent: function() { return ''; },
                getVars: function() { return {'pro': 'dummy-profile'}; },
            }).run(['compat_filter'], function(compatFilter) {
                testApiArgs(compatFilter, {
                    dev: 'firefoxos',
                    device: '',
                    limit: '10',
                    pro: 'dummy-profile'
                });
                assert.equal(compatFilter.isDeviceSelected('firefoxos'), true);
                assert.equal(compatFilter.getFilterDevice(), 'firefoxos');

                // No profile if endpoint not supported.
                assert.equal(compatFilter.apiArgs('').pro, undefined);
            }));
    });
});
