var helpers = require('../lib/helpers');

var firstItemSel = '#gallery .listing li:first-child a';
var scrollPos;

helpers.startCasper({path: '/category/games'});

casper.test.begin('General Scroll tests', {

    test: function(test) {

        casper.waitForSelector('#gallery .listing', function() {
            scrollPos = casper.evaluate(function(Y) {
                window.scrollTo(0, Y);
                return window.scrollY;
            }, casper.getElementBounds(firstItemSel).top);
            casper.click(firstItemSel);
        });

        casper.wait(300, function() {
            var scrollY = casper.evaluate(function() {
                return window.scrollY;
            });
            test.assertEquals(scrollY, 0, 'Check scroll is 0');
            casper.back();
        });

        casper.wait(300, function() {
            var scrollY = casper.evaluate(function() {
                return window.scrollY;
            });
            test.assert(scrollY > 0, 'Check scroll is greater than 0');
            test.assertEquals(scrollY, scrollPos, "Check scroll hasn't changed");
            casper.click(firstItemSel);
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

        casper.run(function() {
            test.done();
        });
    }
});
