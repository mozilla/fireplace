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
        assert.visible('.account-settings button[type="submit"]');
        assert.visible('.account-settings select[name="region"]');
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
        assert.visible('.account-settings select[name="region"]');
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

    test('Tests that we were logged out', function(assert) {
        assert.URL(/\/settings/);

        assert.visible('.account-settings .persona');
        assert.text('.account-settings .persona', 'Sign In / Sign Up');
        assert.invisible('.account-settings .logout');
    });

    test('Set region to Poland', function(assert) {
        assert.equal(suite.getFormValues('.account-settings').region, '');

        suite.evaluate(function() {
            console.log('[*][phantom] Mocking user settings for "region" to be "Poland"');
            window.require('user').get_setting = function(x) { return x == 'region' && 'pl'; };
        });
    });

    test('Tests that region is set to Poland', function(assert) {
        // Reload settings page to see new region.
        suite.press('.header-button.settings');
        assert.equal(suite.getFormValues('.account-settings').region, 'pl');
    });

});
