/*
    Test for category pages.
    Note that most stuff is already tested in app_list.js.
*/

var categoriesTrigger = '.header-categories-btn';

casper.test.begin('Category app list sort tests', {
    test: function(test) {
        helpers.startCasper({path: '/category/games'});

        casper.waitForSelector('.app-list', function() {
            // Test popular link is active by default.
            test.assertVisible('.app-list-filters-sort');
            test.assertSelectorExists('[data-app-list-sort-popular].active');

            // Test switch to new.
            casper.click('[data-app-list-sort-new]');
        });

        casper.waitForSelector('.app-list', function() {
            test.assert(casper.getCurrentUrl().indexOf('sort=reviewed') !== -1);
            test.assertSelectorExists('[data-app-list-sort-new].active');

            // Test switch back to popular.
            casper.click('[data-app-list-sort-popular]');
            test.assert(casper.getCurrentUrl().indexOf('sort=reviewed') === -1);
            test.assertSelectorExists('[data-app-list-sort-popular].active');
        });

        helpers.done(test);
    }
});


casper.test.begin('Category UA tracking tests', {
    test: function(test) {
        helpers.startCasper({path: '/category/games'});

        helpers.waitForPageLoaded(function() {
            // helpers.assertUASetPageVar(test, 'dimension5', 'games');
        });

        helpers.done(test);
    }
});


casper.test.begin('Category mobile nav opens categories', {
    test: function(test) {
        helpers.startCasper('/category/games');

        helpers.waitForPageLoaded();

        casper.thenClick(categoriesTrigger, function() {
            test.assert(casper.evaluate(function() {
                return document.querySelector('.cat-menu-overlay').visible;
            }));
        });

        helpers.done(test);
    }
});


casper.test.begin('Category mobile does not nav open non-categories', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded();

        casper.thenClick(categoriesTrigger, function() {
            test.assertNot(casper.evaluate(function() {
                return document.querySelector('.cat-menu-overlay').visible;
            }));
        });

        helpers.done(test);
    }
});
