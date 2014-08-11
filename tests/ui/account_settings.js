var helpers = require('../helpers');

helpers.startCasper();

casper.test.begin('Test account settings', {
    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            casper.click('.header-button.settings');
        });

        casper.waitForUrl(helpers.makeUrl('/settings'), function() {
            test.assertUrlMatch(/\/settings/);
            test.assertTitle('Account Settings | Firefox Marketplace');
            test.assertVisible('.account-settings .persona');
            test.assertSelectorHasText('.account-settings .persona', 'Sign In / Sign Up');
            test.assertNotVisible('.account-settings .logout');
            test.assertNotVisible('.account-settings button[type="submit"]');
            test.assertNotVisible('.account-settings input[name="email"]');
            test.assertNotVisible('.account-settings input[name="display_name"]');
            helpers.fake_login();
        });

        casper.waitForSelector('.account-settings .logout', function() {
            test.assertUrlMatch(/\/settings/);
            test.assertTitle('Account Settings | Firefox Marketplace');
            test.assertVisible('.account-settings .logout');
            test.assertSelectorHasText('.account-settings .logout', 'Sign Out');
            test.assertNotVisible('.account-settings .persona');
            test.assertVisible('.account-settings button[type="submit"]');
            test.assertVisible('.account-settings input[name="email"]');
            test.assertVisible('.account-settings input[name="display_name"]');
            casper.fill('.account-settings', {
                display_name: 'hello my name is rob hudson'
            });
            casper.click('.account-settings button[type="submit"]');

            test.assertEqual(
                casper.getFormValues('.account-settings').display_name,
                'hello my name is rob hudson'
            );
            casper.click('.logout');
        });

        casper.waitForSelector('.account-settings .only-logged-out', function() {
            test.assertUrlMatch(/\/settings/);
            test.assertVisible('.account-settings .persona');
            test.assertSelectorHasText('.account-settings .persona', 'Sign In / Sign Up');
            test.assertNotVisible('.account-settings .logout');
            test.assertNotVisible('.account-settings footer p:first-child button');
        });

        casper.run(function() {
            test.done();
        });
    }
});
