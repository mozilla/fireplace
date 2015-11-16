define('tests/unit/apps',
    ['tests/unit/helpers'],
    function(h) {

    var mockCapabilities = h.mockDeviceTypeCapabilities;

    describe('apps.incompat', function() {
        it('can work',
           h.injector(mockCapabilities(true)).run(['apps'], function(apps) {
            var product = {
                payment_required: false,
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(!results, 'incompat');
        }));


        it('caches the result',
           h.injector(mockCapabilities(true)).run(['apps'], function(apps) {
            var product = {
                payment_required: false,
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(!results);
            assert('__compat_reasons' in product);
            product.__compat_reasons = 'asdf';
            assert.equal(apps.incompat(product), 'asdf');
        }));


        it('detects payment incompats',
           h.injector(mockCapabilities(true), h.mockSettings())
            .run(['apps'], function(apps) {

            var product = {
                payment_required: true,
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(results);
            assert.equal(results.length, 1);
            assert.equal(results[0], 'not available for your region');
        }));


        it('apps.incompat webapps',
           h.injector(mockCapabilities(false)).run(['apps'], function(apps) {
            var product = {
                payment_required: true,
                price: '1.00',
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(results);
            assert.equal(results.length, 1);
            assert.equal(results[0], 'not available for your platform');
        }));


        it('apps.incompat platform',
           h.injector(mockCapabilities(true)).run(['apps'], function(apps) {
            var product = {
                payment_required: true,
                price: '1.00',
                device_types: ['bar']
            };
            var results = apps.incompat(product);
            assert(results);
            assert.equal(results.length, 1);
            assert.equal(results[0], 'not available for your platform');
        }));


        it('apps.incompat payments unavailable',
           h.injector(mockCapabilities(true)).run(['apps'], function(apps) {
            var product = {
                payment_required: true,
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(results);
            assert.equal(results.length, 1);
            assert.equal(results[0], 'not available for your region');
        }));


        it('apps.incompat platform and webapps',
           h.injector(mockCapabilities(false)).run(['apps'], function(apps) {
            var product = {
                payment_required: true,
                price: '1.00',
                device_types: ['bar']
            };
            var results = apps.incompat(product);
            assert(results);

            // Only return the first one. Both don't make sense.
            assert.equal(results.length, 1);
            assert.equal(results[0], 'not available for your platform');
        }));

        it('sets as incompatible if feature compatibility is false',
           h.injector(mockCapabilities(true)).run(['apps'], function(apps) {
            var product = {
                feature_compatibility: false,
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(results);
            assert.equal(results.length, 1);
            assert.equal(results[0], 'not compatible with your device');
        }));

        it('sets as compatible if feature compatibility is true',
           h.injector(mockCapabilities(true)).run(['apps'], function(apps) {
            var product = {
                feature_compatibility: true,
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(!results, 'apps.incompat(product) should be empty');
        }));

        it('sets as compatible if feature compatibility is null',
           h.injector(mockCapabilities(true)).run(['apps'], function(apps) {
            var product = {
                feature_compatibility: null,
                device_types: ['foo']
            };
            var results = apps.incompat(product);
            assert(!results, 'apps.incompat(product) should be empty');
        }));

        it('sets addon as compatible if addons are enabled',
            h.injector(
                mockCapabilities(true),
                h.mockSettings({addonsEnabled: true})
            ).run(['apps'], function(apps) {
                var product = {
                    isAddon: true,
                    device_types: ['foo']
                };
                var results = apps.incompat(product);
                assert(!results, 'apps.incompat(product) should be empty');
            }
        ));

        it('sets addon as incompatible if addons are not enabled',
            h.injector(
                mockCapabilities(true),
                h.mockSettings({addonsEnabled: false})
            ).run(['apps'], function(apps) {
                var product = {
                    isAddon: true,
                    device_types: ['foo']
                };
                var results = apps.incompat(product);
                assert(results);
                assert.equal(results.length, 1);
                assert.equal(results[0],
                             'not compatible with your device');
            }
        ));
    });

    describe('apps.transform', function() {
        it('detects websites',
            h.injector().run(['apps'], function(apps) {
            var product = {
                url: 'http://example.com',
            };
            product = apps.transform(product);
            assert.equal(product.isWebsite, true);
            assert.equal(product.isApp, undefined);
            assert.equal(product.isAddon, undefined);
            assert.equal(product.isLangpack, false);
        }));

        it('detects addons',
            h.injector().run(['apps'], function(apps) {
            var product = {
                mini_manifest_url: 'http://example.com/extension/lol.webapp',
            };
            product = apps.transform(product);
            assert.equal(product.isWebsite, undefined);
            assert.equal(product.isApp, true);
            assert.equal(product.isAddon, true);
            assert.equal(product.isLangpack, false);
        }));

        it('detects langpacks',
            h.injector().run(['apps'], function(apps) {
            var product = {
                role: 'langpack',
            };
            product = apps.transform(product);
            assert.equal(product.isWebsite, undefined);
            assert.equal(product.isApp, true);
            assert.equal(product.isAddon, false);
            assert.equal(product.isLangpack, true);
        }));

        it('detects regular apps',
            h.injector().run(['apps'], function(apps) {
            var product = {
            };
            product = apps.transform(product);
            assert.equal(product.isWebsite, undefined);
            assert.equal(product.isApp, true);
            assert.equal(product.isAddon, false);
            assert.equal(product.isLangpack, false);
        }));

        it('detects homescreens apps',
            // Note: at the moment homescreens are just like regular apps, as
            // far as fireplace is concerned.
            h.injector().run(['apps'], function(apps) {
            var product = {
                role: 'homescreen',
            };
            product = apps.transform(product);
            assert.equal(product.isWebsite, undefined);
            assert.equal(product.isApp, true);
            assert.equal(product.isAddon, false);
            assert.equal(product.isLangpack, false);
        }));
    });
});
