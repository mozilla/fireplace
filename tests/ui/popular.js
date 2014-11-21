var helpers = require('../helpers');

helpers.startCasper({path: '/popular'});

casper.test.begin('"Popular" page tests', {

    test: function(test) {
        casper.waitForSelector('#splash-overlay.hide', function() {
            // Test count.
            test.assertExists('.app-list li.app:nth-child(24)');
            test.assertDoesntExist('.app-list li.app:nth-child(25)');

            // Test loadmore button.
            test.assertExists('.app-list li.loadmore');

            // Test API call.
            helpers.assertAPICallWasMade('/api/v2/fireplace/search/', {
                cache: '1', lang: 'en-US', limit: '24', region: 'us', vary: '0'
            });

            // Test src.
            var href = this.getElementAttribute('.app-list li a.app-link:nth-child(1)',
                                                'href');
            test.assertEqual(href.split('?')[1], 'src=popular', 'Assert src');
        });

        // Test model cache.
        var modelCount;
        casper.then(function() {
            modelCount = JSON.parse(casper.evaluate(function() {
                return Object.keys(window.require('models')('app').data_store.app).length;
            }));
        });
        casper.then(function() {
            test.assertEqual(modelCount, 24, 'Assert model cache');
        });

        casper.run(function() {
            test.done();
        });
    }
});
