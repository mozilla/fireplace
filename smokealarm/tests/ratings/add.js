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
        suite.capture('asdf');
        assert.URL(/\/app\/can_rate\/ratings\/add/);
    });

    test('Check char count works + submit is enabled', function(assert) {
        assert.visible('.char-count b');
        assert.hasText('.char-count b', '150');
        suite.fill('.add-review-form', {'body': 'test'});
        assert.hasText('.char-count b', '146');
        assert.selectorExists('.add-review-form button[type="submit"][disabled]');
        suite.press('.stars input[value="3"]');
        assert.selectorExists('.add-review-form button[type="submit"]:not([disabled])');
    });

});
