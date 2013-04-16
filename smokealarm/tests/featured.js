var suite = require('./kasperle').suite();

suite.run('/featured', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('ol.listing');
    });

    test('Featured listing baseline tests', function(assert) {
        assert.URL(/\/featured/);

        // Only category listing pages have the #featured container.
        assert.selectorDoesNotExist('#featured');

        assert.visible('#search-results');
        assert.visible('#search-results ol.listing li a.mkt-tile');

        suite.capture('featured-listing.png');

        suite.press('#search-results ol.listing li a.mkt-tile:first-child');
    });

    test('Continue to featured app detail page', function(assert) {
        assert.URL(/\/app\/[a-zA-Z0-9]+/);
    });
});
