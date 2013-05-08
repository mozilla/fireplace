var suite = require('./kasperle').suite();
var scrollPos;

suite.run('/', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('.tabs .active');
    });

    test('Tab scroll tests', function(assert) {
        assert.that(window.scrollY === 0, 'ScrollY starts at 0');
        scrollPos = suite.evaluate(function(tabsTop) {
            window.scrollTo(0, tabsTop);
            return window.scrollY;
        }, suite.getElementBounds('.tabs').top);
        suite.press('.tabs .active + a');
    });

    waitFor(function() {
        return suite.exists('.tabs .active');
    });

    test('Tab scroll click test', function(assert) {
        var scrollY = suite.evaluate(function() {
            return window.scrollY;
        });
        assert.that(scrollY > 0, 'Check scroll is greater than 0');
        assert.equal(scrollY, scrollPos, "Check scroll hasn't changed");
        suite.back();
    });

    waitFor(function() {
        return suite.exists('.tabs .active');
    });

    test('Tab scroll post back button test', function(assert) {
        var scrollY = suite.evaluate(function() {
            return window.scrollY;
        });
        assert.that(scrollY > 0, 'Check scroll is greater than 0');
        assert.equal(scrollY, scrollPos, "Check scroll hasn't changed");
    });

});
