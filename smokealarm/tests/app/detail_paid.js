var suite = require('./kasperle').suite();

suite.run('/app/paid', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Detail page tests for paid apps', function(assert) {
        assert.URL(/\/app\/paid/);
        suite.capture('detail_paid.png');

        assert.invisible('.expand-toggle');
        assert.hasText('h3');

        assert.textIsnt('.mkt-tile h3', 'Loading...');
        assert.text('.mkt-tile .price', '$0.99');

    });
});
