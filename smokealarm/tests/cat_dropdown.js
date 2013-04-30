var suite = require('./kasperle').suite();

suite.run('/', function(test, waitFor) {

    waitFor(function() {
        // Wait for dropdown
        return suite.exists('.dropdown a');
    });

    test('Check and click dropdown', function(assert) {
        assert.hasText('.dropdown a', 'All Categories');
        suite.press('.dropdown a');
    });

    waitFor(function() {
        // Wait for dropdown list
        return suite.exists('.cat-menu');
    });

    test('Click games cat', function() {
        suite.press('.cat-menu .cat-games');
    });

    waitFor(function() {
        // Wait for category page
        return suite.exists('#gallery');
    });

    test('Category drop-down on cats page', function(assert) {
        assert.URL(/\/category\/[a-zA-Z0-9]+/);
        assert.selectorExists('.cat-menu .cat-games.current');
        assert.selectorExists('.dropdown a');
        suite.press('.dropdown a');
    });

    waitFor(function() {
        return suite.exists('.cat-menu');
    });

    test('Click all cats', function() {
        suite.press('.cat-menu .cat-all');
    });

    waitFor(function() {
        // Wait for dropdown
        return suite.exists('.dropdown a');
    });

    test('Check all cats text', function(assert) {
        assert.hasText('.dropdown a', 'All Categories');
        assert.selectorExists('.cat-menu .cat-all.current');
        assert.selectorDoesNotExist('.cat-menu .cat-games.current');
    });

});
