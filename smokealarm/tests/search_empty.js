var suite = require('./kasperle').suite();

suite.run('/', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Perform a search', function(assert) {
        suite.fill('#search', {q: 'empty'}, true);
    });

    waitFor(function() {
        return !suite.exists('.placeholder .spinner');
    });

    test('Test that there are no results', function(assert) {
        assert.URL(/\/search\?q=empty/);
        suite.capture('search_empty.png');

        assert.visible('#search-q');
        assert.selectorDoesNotExist('#featured');
        assert.selectorDoesNotExist('.search-listing');

        assert.hasText('p.no-results', 'No results found');
    });
});
