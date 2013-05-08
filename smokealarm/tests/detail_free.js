var suite = require('./kasperle').suite();

suite.run('/app/free', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Detail page tests for free apps', function(assert) {
        assert.URL(/\/app\/free/);
        suite.capture('detail_free.png');

        assert.invisible('.expand-toggle');
        assert.hasText('h3');

        assert.textIsnt('.mkt-tile h3', 'Loading...');
        assert.text('.mkt-tile .price', 'Free');

    });
});
