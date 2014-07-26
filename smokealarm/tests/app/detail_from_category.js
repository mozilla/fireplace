var suite = require('./kasperle').suite();

suite.run('/category/games', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#gallery li a:first-child');
    });

    test('Click on creatured app', function() {
        suite.press('#gallery li a:first-child');
    });

    test("Test that we're on a detail page", function(assert) {
        assert.URL(/\/app\/[a-zA-Z0-9]+/);
    });
});
