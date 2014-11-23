var helpers = require('../../helpers');

helpers.startCasper({path: '/feed/shelf/kevins-bonanza'});

casper.test.begin('Shelf landing page tests', {
    test: function(test) {
        casper.waitForSelector('.shelf-landing', function() {
            test.assertVisible('.shelf-landing .app', 'Assert apps');

            // Test model cache.
            casper.then(function() {
                var modelCount = casper.evaluate(function() {
                    return Object.keys(window.require('models')('app').data_store.app).length;
                });
                test.assertEqual(modelCount, 6, 'Assert model cache');
            });
        });

        casper.run(function() {
            test.done();
        });
    }
});
