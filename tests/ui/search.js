/*
    Test for the search results page.
    Note that a lot of it is already tested in the app_list.js tests.
*/
var appList = require('../lib/app_list');
var constants = require('../lib/constants');
var helpers = require('../lib/helpers');


casper.test.begin('Test search results header', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            test.assertNotVisible('.search-results-header-desktop');
            casper.fill('.search', {q: 'test'}, true);
        });

        // Test search results count in header.
        casper.waitForSelector('.app-list', function() {
            test.assertUrlMatch(/\/search\?q=test$/);
            test.assertSelectorHasText('.search-results-header',
                                       '"test" returned 42 results');

            appList.waitForLoadMore(function() {
                // Test results count in header after clicking `Load more`.
                test.assertUrlMatch(/\/search\?q=test$/);
                test.assertSelectorHasText('.search-results-header',
                                           '"test" returned 42 results');
            });
        });

        helpers.done(test);
    }
});


casper.test.begin('Test search empty', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            casper.fill('.search', {q: 'empty'}, true);
        });

        casper.waitWhileVisible('.placeholder .spinner', function() {
            test.assertUrlMatch(/\/search\?q=empty/);
            test.assertVisible('#search-q');
            test.assertDoesntExist('.app-list');
            test.assertExists('.app-list-filters', 'Check compatibility filtering is found');
            test.assertExists('.no-results', 'Check no-results header is found');
            test.assertNotVisible('.app-list-filters-expand-wrapper');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test search XSS', {
    test: function(test) {
        helpers.startCasper({
            path: '/search?q=%3Cscript+id%3D%22%23xss-script%22%3E%3C%2Fscript%3E'
        });

        helpers.waitForPageLoaded(function() {
            test.assertDoesntExist('#xss-script');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test search author', {
    test: function(test) {
        helpers.startCasper({path: '/search?author=test'});

        casper.waitForSelector('.app-list', function() {
            test.assertUrlMatch(/\/search\?author=test$/);
            // Test search results count in header.
            test.assertField('q', 'test');

            // Test search results count in header.
            test.assertSelectorHasText('.search-results-header',
                                       '"test" returned 42 results');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test search potato', {
    test: function(test) {
        helpers.startCasper({path: '/search?q=%3Apaid'});

        casper.waitForSelector('.app-list', function() {
            // Test search results count in input.
            test.assertField('q', ':paid');

            // Test search results count in header.
            test.assertSelectorHasText('.search-results-header',
                                       '":paid" returned 42 results');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test search results header desktop', {
    test: function(test) {
        helpers.startCasper({path: '/search?q=abc', viewport: 'tablet'});

        helpers.waitForPageLoaded(function() {
            test.assertNotVisible('.search-results-header-mobile');
            test.assertVisible('.search-results-header-desktop');
        });

        helpers.done(test);
    }
});
