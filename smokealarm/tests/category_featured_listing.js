var suite = require('./kasperle').suite();

suite.run('/category/shopping', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#featured li a');
    });

    test('Navigate from the category to the featured listing', function(assert) {
        assert.URL(/\/category\/[a-zA-Z0-9]+/);
        suite.press('#gallery .view-all');

    });

    waitFor(function() {
        return suite.exists('ol.listing');
    });

    test('Category featured listing baseline tests', function(assert) {
        suite.capture('category_featured.png');

        // Only category listing pages have the #featured container.
        assert.selectorDoesNotExist('#gallery');

        assert.visible('#search-results');
        assert.visible('#search-results ol.listing li a.mkt-tile');

        suite.press('#search-results ol.listing li a.mkt-tile:first-child');

    });

    test('Continue to featured app detail page', function(assert) {
        assert.URL(/\/app\/[a-zA-Z0-9]+/);
    });
});
