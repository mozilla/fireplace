var suite = require('./kasperle').suite();

suite.run('/category/shopping', function(test, waitFor) {

    waitFor(function() {
        // Wait for dropdown
        return suite.exists('.dropdown a');
    });

    test('Check and click dropdown', function(assert) {
        assert.hasText('.dropdown a', 'Shopping');
        suite.press('.dropdown a');
    });

    waitFor(function() {
        // Wait for dropdown list
        return suite.exists('.cat-menu');
    });

    test('Click social cat', function() {
        suite.press('.cat-menu .cat-social');
    });

    waitFor(function() {
        // Wait for category page
        return suite.exists('#gallery');
    });

    test('Category drop-down on cats page', function(assert) {
        assert.URL(/\/category\/[a-zA-Z0-9]+/);
        assert.selectorExists('.cat-menu .cat-social.current');
        assert.selectorExists('.dropdown a');
        suite.press('.dropdown a');
    });

    waitFor(function() {
        return suite.exists('.cat-menu');
    });

    test('Click all cats', function() {
        suite.press('.cat-menu .cat-shopping');
    });

    waitFor(function() {
        return suite.exists('.dropdown a');
    });

    test('Check shopping cats text', function(assert) {
        assert.hasText('.dropdown a', 'Shopping');
        assert.selectorExists('.cat-menu .cat-shopping.current');
        assert.selectorDoesNotExist('.cat-menu .cat-social.current');
    });

});
