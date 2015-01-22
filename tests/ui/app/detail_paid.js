var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/app/paid'});

casper.test.begin('Detail page tests for paid apps', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertUrlMatch(/\/app\/paid/);
            test.assertNotVisible('.expand-toggle');
            helpers.assertContainsText('h3');
            test.assertSelectorDoesntHaveText('.mkt-tile h3', 'Loading...');
            test.assertSelectorHasText('.mkt-tile .price', '$0.99');
        });

        casper.run(function() {
           test.done();
        });
    }
});
