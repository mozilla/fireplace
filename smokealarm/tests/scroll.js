var suite = require('./kasperle').suite();
var scrollPos;
var firstItemSel = '#gallery .listing li:first-child a';

suite.run('/category/games', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#gallery .listing');
    });

    test('General scroll tests', function(assert) {
        assert.that(window.scrollY === 0, 'ScrollY starts at 0');
        scrollPos = suite.evaluate(function(Y) {
            window.scrollTo(0, Y);
            return window.scrollY;
        }, suite.getElementBounds(firstItemSel).top);
        suite.press(firstItemSel);
    });

    waitFor(function() {
        return suite.exists('#page');
    });

    test('Check scroll position test', function(assert) {
        var scrollY = suite.evaluate(function() {
            return window.scrollY;
        });
        assert.equal(scrollY, 0, 'Check scroll is 0');
        suite.back();
    });

    waitFor(function() {
        return suite.exists('#gallery');
    });

    test('Scroll post back button test', function(assert) {
        var scrollY = suite.evaluate(function() {
            return window.scrollY;
        });
        assert.that(scrollY > 0, 'Check scroll is greater than 0');
        assert.equal(scrollY, scrollPos, "Check scroll hasn't changed");
        suite.press(firstItemSel);
    });

    waitFor(function() {
        return suite.exists('#nav-back');
    });

    test('Click back link', function(assert) {
        suite.press('#nav-back');
    });

    waitFor(function() {
        return suite.exists('#page');
    });

    test('Scroll back link test', function(assert) {
        var scrollY = suite.evaluate(function() {
            return window.scrollY;
        });
        assert.that(scrollY > 0, 'Check scroll is greater than 0');
        assert.equal(scrollY, scrollPos, "Check scroll hasn't changed");
    });

});
