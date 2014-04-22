var suite = require('./kasperle').suite();

suite.run('/', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Perform a search', function(assert) {
        suite.fill('#search', {q: 'test'}, true);
    });

    waitFor(function() {
        return suite.exists('.search-listing li');
    });

    test('Search baseline tests', function(assert) {
        assert.URL(/\/search\?q=test/);
        suite.capture('search.png');

        assert.visible('#search-q');
        assert.selectorDoesNotExist('#featured');
        // There should be 26 elements in the listing: 25 items + "load more".
        assert.selectorExists('.search-listing li:nth-child(26)');
        assert.selectorDoesNotExist('.search-listing li:nth-child(27)');

        assert.hasText('#search-results h2', '42 Results');
        assert.visible('.search-listing li a.mkt-tile');
        assert.visible('#search-results .expand-toggle');

        suite.press('li.loadmore button');

    });

    waitFor(function() {
        return suite.exists('.search-listing li:nth-child(26)');
    });

    test('Test that more apps were loaded', function(assert) {
        assert.URL(/\/search\?q=test/);
        suite.capture('search_loadedmore.png');

        assert.hasText('#search-results h2', '42 Results');
        // There should be 42 elements in the listing: 42 items and that's it.
        assert.selectorExists('.search-listing li:nth-child(42)');
        assert.selectorDoesNotExist('.search-listing li:nth-child(43)');

        suite.press('.header-button.back');
    });

    test('Perform the search again', function(assert) {
        suite.fill('#search', {q: 'test'}, true);
    });

    waitFor(function() {
        return suite.exists('.search-listing li:nth-child(26)');
    });

    test('Test that more apps were loaded', function(assert) {
        assert.URL(/\/search\?q=test/);
        suite.capture('search_loadedmore_cacherewriting.png');

        assert.hasText('#search-results h2', '42 Results');
        // Thanks to cache rewriting, we should have loaded everything we have,
        // that is, the complete list of 42 items.
        assert.selectorExists('.search-listing li:nth-child(42)');
        assert.selectorDoesNotExist('.search-listing li:nth-child(43)');

        suite.press('.search-listing li a.mkt-tile:first-child');
    });

    test('Continue to detail page', function(assert) {
        assert.URL(/\/app\/[a-zA-Z0-9]+/);
    });
});
