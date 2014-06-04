var suite = require('./kasperle').suite();
var lib = require('./lib');

suite.run('/', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Navigate from homeapge', function() {
        suite.press('.header-button.settings');
    });

    test('Tests for logged out account settings', function(assert) {
        assert.URL(/\/settings/);

        suite.capture('account_settings_logged_out.png');
        assert.title('Account Settings | Firefox Marketplace');

        assert.visible('.account-settings .persona');
        assert.text('.account-settings .persona', 'Sign In / Sign Up');
        assert.invisible('.account-settings .logout');
        assert.invisible('.account-settings button[type="submit"]');
        assert.invisible('.account-settings input[name="email"]');
        assert.invisible('.account-settings input[name="display_name"]');

        // Trigger a fake Persona login
        lib.fake_login(suite);
    });

    test('Tests for logged in account settings', function(assert) {
        assert.URL(/\/settings/);

        suite.capture('account_settings_logged_in.png');
        assert.title('Account Settings | Firefox Marketplace');

        assert.visible('.account-settings .logout');
        assert.text('.account-settings .logout', 'Sign Out');
        assert.invisible('.account-settings .persona');
        assert.visible('.account-settings button[type="submit"]');
        assert.visible('.account-settings input[name="email"]');
        assert.visible('.account-settings input[name="display_name"]');

        suite.fill('.account-settings', {
            display_name: 'hello my name is rob hudson'
        });
        suite.press('.account-settings button[type="submit"]');
    });

    test('Tests that values were saved', function(assert) {
        assert.URL(/\/settings/);

        assert.equal(
            suite.getFormValues('.account-settings').display_name,
            'hello my name is rob hudson'
        );

        suite.press('.logout');
    });

    waitFor(function() {
        return suite.visible('.account-settings .only-logged-out');
    });

    test('Tests that we were logged out', function(assert) {
        assert.URL(/\/settings/);

        assert.visible('.account-settings .persona');
        assert.text('.account-settings .persona', 'Sign In / Sign Up');
        assert.invisible('.account-settings .logout');
        assert.invisible('.account-settings footer p:first-child button');
    });

});
