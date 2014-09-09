var helpers = require('../helpers');

helpers.startCasper();

casper.test.begin('Search baseline tests', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            casper.fill('#search', {q: 'test'}, true);
        });

        casper.waitForSelector('.search-listing li', function() {
            test.assertUrlMatch(/\/search\?q=test$/);
            test.assertVisible('#search-q');
            test.assertDoesntExist('#featured');
            // There should be 26 elements in the listing: 25 items + "load more".
            test.assertExists('.search-listing li:nth-child(26)');
            test.assertDoesntExist('.search-listing li:nth-child(27)');
            test.assertSelectorHasText('#search-results h2', '42 Results');
            test.assertSelectorHasText('#search-results h2 .subtitle', 'Showing 1–25');
            helpers.assertAPICallWasMade('/api/v2/fireplace/search/', {
                cache: '1', lang: 'en-US', limit: '25', q: 'test', region: 'us', vary: '0'
            });
            test.assertVisible('.search-listing li a.mkt-tile');
            test.assertVisible('#search-results .expand-toggle');
            casper.click('li.loadmore button');
        });

        casper.waitForSelector('.search-listing li:nth-child(42)', function() {
            test.assertUrlMatch(/\/search\?q=test$/);
            test.assertSelectorHasText('#search-results h2', '42 Results');
            test.assertSelectorHasText('#search-results h2 .subtitle', 'Showing 1–42');
            helpers.assertAPICallWasMade('/api/v2/fireplace/search/', {
                cache: '1', lang: 'en-US', limit: '25', q: 'test', offset: '25', region: 'us', vary: '0'
            });
            casper.click('.header-button.back');
            casper.fill('#search', {q: 'test'}, true);
        });

        casper.waitForSelector('.search-listing li:nth-child(42)', function() {
            test.assertUrlMatch(/\/search\?q=test$/);
            test.assertSelectorHasText('#search-results h2', '42 Results');
            test.assertSelectorHasText('#search-results h2 .subtitle', 'Showing 1–42');
            casper.click('.search-listing li a.mkt-tile:first-child');
            test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
        });

        // Test device filtering using query string.
        casper.thenOpen(helpers.makeUrl('/search?q=test&dev=desktop'), function() {
            casper.waitForSelector('#splash-overlay.hide', function() {
                test.assertUrlMatch(/\/search\?q=test&dev=desktop$/);
                helpers.assertAPICallWasMade('/api/v2/fireplace/search/', {
                    cache: '1', dev: 'desktop', lang: 'en-US', limit: '25', q: 'test', region: 'us', vary: '0'
                });

                // There should be 26 elements in the listing: 25 items + "load more".
                test.assertExists('.search-listing li:nth-child(26)');
                test.assertDoesntExist('.search-listing li:nth-child(27)');
                test.assertSelectorHasText('#search-results h2', '42 Results');
                test.assertSelectorHasText('#search-results h2 .subtitle', 'Showing 1–25 Desktop Apps');
                test.assertVisible('.search-listing li a.mkt-tile');
                test.assertVisible('#search-results .expand-toggle');
                casper.click('li.loadmore button');
            });

            casper.waitForSelector('.search-listing li:nth-child(42)', function() {
                test.assertUrlMatch(/\/search\?q=test&dev=desktop$/);
                test.assertSelectorHasText('#search-results h2', '42 Results');
                test.assertSelectorHasText('#search-results h2 .subtitle', 'Showing 1–42 Desktop Apps');
                casper.click('.header-button.back');
                casper.fill('#search', {q: 'test'}, true);
            });

            // Doing a new search when we are filtering by device clears the filtering,
            // so cache rewriting isn't done : it's a new search.
            casper.waitForSelector('.search-listing li:nth-child(26)', function() {
                casper.waitForUrl(/\/search\?q=test$/, function() {
                    test.assertUrlMatch(/\/search\?q=test$/);
                    test.assertSelectorHasText('#search-results h2', '42 Results');
                    test.assertSelectorHasText('#search-results h2 .subtitle', 'Showing 1–25');
                    casper.click('.search-listing li a.mkt-tile:first-child');
                    test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
                });
            });
        });

        casper.run(function() {
            test.done();
        });
    }
});
