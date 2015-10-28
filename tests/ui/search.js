/*
    Test for the search results page.
    Note that a lot of it is already tested in the app_list.js tests.
*/
var appList = helpers.load('app_list');

casper.test.begin('Test search results header', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            test.assertNotVisible('.search-results-header-desktop');
            casper.fill('.header--search-form', {q: 'test'}, true);
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

casper.test.begin('Test search results page type meowEnabled:false', {
    test: function(test) {
        helpers.startCasper('/');

        // Disable meow.
        helpers.waitForPageLoaded(function() {
            casper.evaluate(function() {
                require('core/settings')._extend({meowEnabled: false});
            });
            casper.fill('.header--search-form', {q: 'test'}, true);
        });

        casper.waitForSelector('.app-list', function() {
            test.assert(helpers.isLeafPage(), 'is a leaf page');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test search results page type meowEnabled:true', {
    test: function(test) {
        helpers.startCasper('/');

        // Enable meow.
        helpers.waitForPageLoaded(function() {
            casper.evaluate(function() {
                require('core/settings')._extend({meowEnabled: true});
            });
            casper.fill('.header--search-form', {q: 'test'}, true);
        });

        casper.waitForSelector('.app-list', function() {
            test.assert(!helpers.isLeafPage(), 'is not leaf page');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test search empty', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            casper.fill('.header--search-form', {q: 'empty'}, true);
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
            test.assertSelectorHasText('.search-results-header',
                                       '"test" returned 42 results');

        });

        helpers.done(test);
    }
});


casper.test.begin('Test developer listing page type meowEnabled:false', {
    test: function(test) {
        helpers.startCasper({path: '/app/free'});

        // Disable meow.
        casper.waitForSelector('.app-reviews', function() {
            casper.evaluate(function() {
                require('core/settings')._extend({meowEnabled: false});
            });
            casper.click('[itemprop=creator] a');
        });

        casper.waitForSelector('.app-list', function() {
            test.assert(helpers.isLeafPage(), 'is a leaf page');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test search results page type meowEnabled:true', {
    test: function(test) {
        helpers.startCasper({path: '/app/free'});

        // Enable meow.
        casper.waitForSelector('.app-reviews', function() {
            casper.evaluate(function() {
                require('core/settings')._extend({meowEnabled: true});
            });
            casper.click('[itemprop=creator] a');
        });

        casper.waitForSelector('.app-list', function() {
            test.assert(helpers.isLeafPage(), 'is a leaf page');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test search potato', {
    test: function(test) {
        helpers.startCasper({path: '/search?q=%3Apaid'});

        casper.waitForSelector('.app-list', function() {
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


casper.test.begin('Test UA track keyword leading to app view', {
    test: function(test) {
        helpers.startCasper('/search?q=abc');

        helpers.waitForPageLoaded(function() {
            casper.click('.mkt-tile');
        });

        casper.waitForSelector('[data-page-type~="detail"]', function() {
            casper.click('.mkt-wordmark');
        });

        casper.waitWhileSelector('[data-page-type~="detail"]', function() {
            var dimensions = helpers.filterUALogs(['send', 'pageview'])[0][2];
            test.assertEquals(dimensions.dimension12, 'abc');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA track keyword leading to app install on detail', {
    test: function(test) {
        helpers.startCasper('/search?q=abc');

        helpers.waitForPageLoaded(function() {
            casper.click('.mkt-tile');
        });

        casper.waitForSelector('[data-page-type~="detail"]', function() {
            casper.click('.install');
        });

        casper.waitForSelector('.launch', function() {
            var beginInstallDimensions = helpers.filterUALogs(
                ['send', 'event', 'Click to install app'])[0][5];
            var doneInstallDimensions = helpers.filterUALogs(
                ['send', 'event', 'Successful app install'])[0][5];
            test.assertEquals(beginInstallDimensions.dimension13, 'abc');
            test.assertEquals(doneInstallDimensions.dimension13, 'abc');
        });

        helpers.done(test);
    }
});
