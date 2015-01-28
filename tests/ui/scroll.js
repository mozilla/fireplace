/*
    Test that navigating to a page and back maintains scroll position.
*/
var appList = require('../lib/app_list');
var helpers = require('../lib/helpers');

var appSelector = appList.appNthChild(1) + ' .mkt-tile';

casper.test.begin('Scroll tests', {
    test: function(test) {
        helpers.startCasper({path: '/category/games'});

        // Open app list, scroll down, click on app.
        casper.waitForSelector('.app-list', function() {
            scrollPos = casper.evaluate(function(Y) {
                window.scrollTo(0, Y);
                return window.scrollY;
            }, casper.getElementBounds(appSelector).top);
            casper.click(appSelector);
        });

        // Test it automatically scrolled to top, then go back.
        casper.waitForSelector('[data-page-type~=detail]', function() {
            casper.wait(300, function() {  // Wait for scroll to kick in.
                var scrollY = casper.evaluate(function() {
                    return window.scrollY;
                });
                test.assertEquals(scrollY, 0, 'Check scroll is 0');
                casper.back();
            });
        });

        // Check that the scroll is reverted back.
        casper.waitForSelector('.app-list', function() {
            var scrollY = casper.evaluate(function() {
                return window.scrollY;
            });
            test.assert(scrollY > 0, 'Check scroll greater than 0');
            test.assertEquals(scrollY, scrollPos, 'Check scroll not changed');
            casper.click(appSelector);
        });

        casper.waitForSelector('#nav-back', function() {
            casper.click('#nav-back');
        });

        casper.wait(300, function() {
            var scrollY = casper.evaluate(function() {
                return window.scrollY;
            });
            test.assert(scrollY > 0, 'Check scroll is greater than 0');
            test.assertEquals(scrollY, scrollPos, "Check scroll hasn't changed");
        });

        helpers.done(test);
    }
});
