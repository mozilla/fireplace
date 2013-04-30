var suite = require('./kasperle').suite();

suite.run('/search?q=test', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#search-results');
    });

    test('Ensure no cat dropdown on search page', function(assert) {
        assert.invisible('.dropdown a');
    });

    test('Click on search result', function() {
        suite.press('#search-results li a:first-child');
    });

    test("Test that we're on a detail page", function(assert) {
        assert.URL(/\/app\/[a-zA-Z0-9]+/);
    });
});
