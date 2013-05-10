// Desktop tests for feedback modal
var suite = require('./kasperle').suite();

suite.run('/', function(test, waitFor) {

    test('Set viewport to desktop', function() {
        suite.viewport(720, 500);
    });

    waitFor(function() {
        return suite.exists('#site-footer .submit-feedback');
    });

    // TODO have a way to setup/teardown prior to navigating.
    test('Navigate back to /', function(assert) {
        suite.press('h1.site a');
    });

    waitFor(function() {
        return suite.exists('#site-footer .submit-feedback');
    });

    test('Clicking on feedback link', function(assert) {
        suite.press('#site-footer .submit-feedback');
    });

    waitFor(function() {
        return suite.visible('.feedback.modal');
    });

    test('Check modal displayed', function(assert) {
        suite.capture('feedback.png');
        assert.visible('.feedback.modal');
        assert.visible('.feedback-form textarea');
        assert.selectorExists('.potato-captcha');
        assert.invisible('.potato-captcha');
        assert.selectorExists('.feedback-form button[disabled]');
    });

    test('Verify form is submitted', function(assert) {
        suite.fill('.feedback-form', {'feedback': 'test'});
        assert.selectorExists('.feedback-form button:not([disabled])');
    });

    test('Restore viewport', function() {
        // Needed or else we are stuck on 1024x768
        suite.viewport(400, 300);
    });

});
