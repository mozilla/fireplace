var suite = require('./kasperle').suite();

suite.run('/app/foo/abuse', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('App abuse baseline tests', function(assert) {
        assert.title('Report Abuse | Firefox Marketplace');

        assert.visible('.abuse-form');
        assert.visible('.abuse-form textarea');
        assert.selectorExists('.abuse-form button[disabled]');
        suite.capture('app-abuse-form.png');
    });

    test('Verify form is submitted', function(assert) {
        suite.fill('.abuse-form', {'text': 'test'});
        assert.selectorExists('.abuse-form button:not([disabled])');
    });

    test("Test that we're on an app abuse page", function(assert) {
        assert.URL(/\/app\/foo\/abuse/);
    });

    test('Test abuse form submission URL redirect', function(assert) {
        suite.press('.abuse-form button');
        assert.URL(/\/app\/foo/);
    });
});
