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
            test.assertVisible('.sort-toggle');

            // Test switch to new.
            casper.click('.sort-toggle-new a');
        });

        casper.waitForSelector('.app-list', function() {
            test.assert(casper.getCurrentUrl().indexOf('sort=reviewed') !== -1);

            // Test switch back to popular.
            casper.click('.sort-toggle-popular a');
            test.assert(casper.getCurrentUrl().indexOf('sort=reviewed') === -1);
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
            test.assertExists('.cat-menu-overlay.overlay-visible');
        });

        helpers.done(test);
    }
});


casper.test.begin('Category mobile nav does not open non-categories', {
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
