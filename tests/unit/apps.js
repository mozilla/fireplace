define('tests/unit/apps',
    ['tests/unit/helpers'],
    function(h) {

    function mockCapabilities(webApps) {
        return function(injector) {
            return injector.mock('core/capabilities', {
                device_type: function() {return 'foo';},
                webApps: webApps
            });
        };
    }


    describe.only('apps.incompat', function() {
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
            assert.equal(results[0], 'Not available for your region');
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
            assert.equal(results[0], 'Not available for your platform');
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
            assert.equal(results[0], 'Not available for your platform');
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
            assert.equal(results[0], 'Not available for your region');
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
            assert.equal(results[0], 'Not available for your platform');
        }));
    });
});
