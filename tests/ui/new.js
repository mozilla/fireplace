var helpers = require('../helpers');

helpers.startCasper({path: '/new'});

casper.test.begin('"New" page tests', {

    test: function(test) {
        casper.waitForSelector('#splash-overlay.hide', function() {
            // Test app count.
            test.assertExists('.app-list li.app:nth-child(24)');
            test.assertDoesntExist('.app-list li.app:nth-child(25)');

            // Test loadmore button.
            test.assertExists('.app-list li.loadmore');

            // Test API call.
            helpers.assertAPICallWasMade('/api/v2/fireplace/search/', {
                cache: '1', lang: 'en-US', limit: '24', region: 'us',
                sort: 'reviewed', vary: '0'
            });

            // Test src.
            var href = this.getElementAttribute('.app-list li a.app-link:nth-child(1)',
                                                'href');
            test.assertEqual(href.split('?')[1], 'src=new', 'Assert src');

            // Test model cache.
            casper.then(function() {
                var modelCount = casper.evaluate(function() {
                    return Object.keys(window.require('models')('app').data_store.app).length;
                });
                test.assertEqual(modelCount, 24, 'Assert model cache');
            });
        });

        casper.run(function() {
            test.done();
        });
    }
});
