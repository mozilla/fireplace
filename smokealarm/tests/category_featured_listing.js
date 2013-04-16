var suite = require('./kasperle').suite();

suite.run('/category/shopping/featured', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('ol.listing');
    });

    test('Category featured listing baseline tests', function(assert) {
        assert.URL(/\/category\/shopping\/featured/);

        assert.selectorDoesNotExist('#featured');

        assert.visible('#search-results');
        assert.visible('#search-results ol.listing li a.mkt-tile');

        suite.capture('category-featured-listing.png');

        suite.press('#search-results ol.listing li a.mkt-tile:first-child');

    });

    test('Continue to featured app detail page', function(assert) {
        assert.URL(/\/app\/[a-zA-Z0-9]+/);
    });
});
