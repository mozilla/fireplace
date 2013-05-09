var suite = require('./kasperle').suite();

suite.run('/app/packaged', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Test that packaged apps display properly', function(assert) {
        assert.URL(/\/app\/packaged/);
        suite.capture('detail_packaged.png');

        assert.selectorExists('.blurbs .package-version');
        assert.text('.blurbs.package-version', 'Latest version: 1.0');

    });
});
