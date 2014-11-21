var helpers = require('../../helpers');

helpers.startCasper({path: '/feed/collection/kevins-bonanza'});

casper.test.begin('Collection landing page tests', {
    test: function(test) {
        casper.waitForSelector('.collection-landing', function() {
            test.assertVisible('.collection-landing .app', 'Assert apps');

            // Test model cache.
            casper.then(function() {
                var modelCount = casper.evaluate(function() {
                    return Object.keys(window.require('models')('app').data_store.app).length;
                });
                test.assertEqual(modelCount, 3, 'Assert model cache');
            });
        });

        casper.run(function() {
            test.done();
        });
    }
});
