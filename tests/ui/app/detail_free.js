var helpers = require('../../helpers');

helpers.startCasper({path: '/app/free'});

casper.test.begin('Detail page tests for free apps', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertUrlMatch(/\/app\/free/);
            test.assertNotVisible('.expand-toggle');
            helpers.assertContainsText('h3');
            test.assertSelectorDoesntHaveText('.mkt-tile h3', 'Loading...');
            test.assertSelectorHasText('.mkt-tile .price', 'Free');
        });

        casper.run(function() {
           test.done();
        });
    }
});
