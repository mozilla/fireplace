var suite = require('./kasperle').suite();

suite.run('/app/foo/ratings/edit', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Check redirected to app page', function(assert) {
        assert.URL(/\/app\/foo/);
    });
});
