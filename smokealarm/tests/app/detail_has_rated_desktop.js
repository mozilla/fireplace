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

suite.run('/app/has_rated', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Assert sign-in to review button present', function(assert) {
        assert.hasText('#add-review', 'Sign in to Review');
        // Trigger a fake Persona login
        lib.fake_login(suite);
    });

    waitFor(function() {
        return suite.exists('#edit-review');
    });

    test('Assert edit your review', function(assert) {
        assert.hasText('#edit-review', 'Edit your Review');
        suite.press('.logout');
    });

    waitFor(function(assert) {
        return suite.exists('#add-review');
    });

    test('Assert sign-in to review', function(assert) {
        assert.hasText('#add-review', 'Sign in to Review');
    });

});
