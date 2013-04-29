var suite = require('./kasperle').suite();

suite.run('/category/foo', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#featured li a');
    });

    test('Category baseline tests', function(assert) {
        assert.URL(/\/category\/[a-zA-Z0-9]+/);
        suite.capture('category.png');

        assert.visible('#search-q');
        assert.selectorExists('#featured');
        assert.selectorExists('#featured ol.grid li a h3:not(:empty)');

        assert.visible('#gallery');
        assert.visible('#gallery ol.listing li a.mkt-tile');

        suite.press('#gallery ol.listing li a.mkt-tile:first-child');

    });

    test('Continue to detail page', function(assert) {
        assert.URL(/\/app\/[a-zA-Z0-9]+/);
    });
});
