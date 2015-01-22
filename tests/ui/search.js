/*
    Test for the search results page.
    Note that a lot of it is already tested in the app_list.js tests.
*/
var appList = require('../lib/app_list');
var constants = require('../lib/constants');
var helpers = require('../lib/helpers');

var appNthChild = appList.appNthChild;

casper.test.begin('Search results header tests', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            casper.fill('.search', {q: 'test'}, true);
        });

        // Test search results count in header.
        casper.waitForSelector('.app-list', function() {
            test.assertUrlMatch(/\/search\?q=test$/);
            test.assertSelectorHasText('.search-results-header', '42 Results');

            appList.waitForLoadMore(function() {
                // Test results count in header after clicking `Load more`.
                test.assertUrlMatch(/\/search\?q=test$/);
                test.assertSelectorHasText('.search-results-header',
                                           '42 Results');
            });
        });

        helpers.done(test);
    }
});

casper.test.begin('Search device filtering tests', {
    test: function(test) {
        helpers.startCasper({path: '/search?q=test&device_override=desktop'});

        helpers.waitForPageLoaded(function() {
            test.assertField('compatibility_filtering', 'desktop');

            casper.fill('.search', {q: 'test'}, true);

            // New search during dev. filter clears filter.
            casper.waitForSelector('.app-list', function() {
                casper.waitForUrl(/\/search\?q=test$/, function() {
                    test.assertField('compatibility_filtering', 'all');
                });
            });
        });

        helpers.done(test);
    }
});
