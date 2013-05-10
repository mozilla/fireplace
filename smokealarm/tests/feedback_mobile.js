// Mobile tests for feedback
var suite = require('./kasperle').suite();

suite.run('/settings', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Click through to feedback form', function(assert) {
        suite.press('#account-settings .toggles li:last-child a');
    });

    test('Check form exists', function(assert) {
        suite.capture('feedback.png');
        assert.visible('.feedback-form textarea');
        assert.selectorExists('.potato-captcha');
        assert.invisible('.potato-captcha');
        assert.selectorExists('.feedback-form button[disabled]');
    });

    test('Verify form is submitted', function(assert) {
        suite.fill('.feedback-form', {'feedback': 'test'});
        assert.selectorExists('.feedback-form button:not([disabled])');
    });
});
