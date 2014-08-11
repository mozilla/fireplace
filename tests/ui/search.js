var helpers = require('../helpers');

helpers.startCasper();

casper.test.begin('Search baseline tests', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            casper.fill('#search', {q: 'test'}, true);
        });

        casper.waitForSelector('.search-listing li', function() {
            test.assertUrlMatch(/\/search\?q=test/);
            test.assertVisible('#search-q');
            test.assertDoesntExist('#featured');
            // There should be 26 elements in the listing: 25 items + "load more".
            test.assertExists('.search-listing li:nth-child(26)');
            test.assertDoesntExist('.search-listing li:nth-child(27)');
            test.assertSelectorHasText('#search-results h2', '42 Results');
            test.assertVisible('.search-listing li a.mkt-tile');
            test.assertVisible('#search-results .expand-toggle');
            casper.click('li.loadmore button');
        });

        casper.waitForSelector('.search-listing li:nth-child(26)', function() {
            test.assertUrlMatch(/\/search\?q=test/);
            test.assertSelectorHasText('#search-results h2', '42 Results');
            casper.click('.header-button.back');
            casper.fill('#search', {q: 'test'}, true);
        });

        casper.waitForSelector('.search-listing li:nth-child(26)', function() {
            test.assertUrlMatch(/\/search\?q=test/);
            test.assertSelectorHasText('#search-results h2', '42 Results');
            casper.click('.search-listing li a.mkt-tile:first-child');
            test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
        });

        casper.run(function() {
            test.done();
        });
    }
});
