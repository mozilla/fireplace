var suite = require('./kasperle').suite();
var lib = require('./lib');

// Desktop only tests.
suite.marionetteSkip = true;

suite.setUp = function(){
    suite.viewport(1024, 768);
};

suite.tearDown = function(){
    suite.viewport(400, 300);
};

suite.run('/app/can_rate', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Assert sign-in to review button present', function(assert) {
        assert.hasText('#add-review', 'Sign in to Review');
        suite.press('.write-review');
        lib.fake_login(suite);
    });

    waitFor(function() {
        return suite.exists('#add-review');
    });

    test('Assert modal is visible', function(assert) {
        assert.visible('.compose-review.modal');
    });

    test('Verify form is filled and button is enabled.', function(assert) {
        suite.press('.ratingwidget label:last-child');
        suite.fill('.add-review-form', {body: 'this is a test'});
        assert.selectorExists('.add-review-form button:not([disabled])');
        suite.press('.add-review-form button');
    });

    waitFor(function() {
        return !suite.visible('.compose-review.modal');
    });

    test('Verify form is submitted and cloak is gone', function(assert) {
        assert.invisible('.compose-review.modal');
        assert.selectorDoesNotExist('.cloak.show');
    });

});
