var suite = require('./kasperle').suite();

suite.run('/category/foo', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Click on creatured app', function() {
        suite.press('#featured li a:first-child');
    });

    test("Test that we're on a detail page", function(assert) {
        assert.URL(/\/app\/[a-zA-Z0-9]+/);
    });
});
