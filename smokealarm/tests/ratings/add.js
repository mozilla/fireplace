var suite = require('./kasperle').suite();
var lib = require('./lib');

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
        return suite.exists('.compose-review');
    });

    test('Assert we are on rating add page', function(assert) {
        assert.URL(/\/app\/can_rate\/ratings\/add/);
    });

});
