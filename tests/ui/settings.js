var helpers = require('../lib/helpers');
var _ = require('../../node_modules/underscore');

casper.test.begin('Test settings', {
    test: function(test) {
        helpers.startCasper({path: '/settings'});

        casper.waitUntilVisible('.account-settings .persona', function() {
            test.assertNotVisible('.account-settings .logout');
            test.assertNotVisible('.account-settings-save button[type="submit"]');
            test.assertNotVisible('.account-settings .email');
            test.assertNotVisible('.account-settings input[name="display_name"]');
            test.assertNotVisible('.account-settings input[name="enable_recommendations"]');
            helpers.fake_login();
        });

        casper.waitUntilVisible('.account-settings .logout', function() {
            test.assertNotVisible('.account-settings .persona');
            test.assertVisible('.account-settings-save button[type="submit"]');
            test.assertVisible('.account-settings .email');
            test.assertVisible('.account-settings input[name="display_name"]');
            test.assertVisible('.account-settings input[name="enable_recommendations"]');
            casper.fill('.account-settings', {
                display_name: 'hello my name is rob hudson'
            });
            test.assertVisible('.account-settings .newsletter-info');
            test.assert(helpers.checkValidity('.account-settings'),
                        'Account settings form is valid');
            casper.click('.account-settings-save [type="submit"]');

            test.assertEqual(
                casper.getFormValues('.account-settings').display_name,
                'hello my name is rob hudson'
            );

            casper.click('.account-settings-save .logout');
        });

        casper.waitUntilVisible('.account-settings', function() {
            test.assertSelectorHasText('.account-settings-save .login', 'Sign In');
            test.assertSelectorHasText('.account-settings-save .register', 'Register');
            test.assertNotVisible('.account-settings-save .logout');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test settings recommendations', helpers.desktopTest({
    test: function(test) {
        helpers.startCasper({path: '/settings'});

        helpers.waitForPageLoaded(function() {
            helpers.fake_login();
        });

        helpers.waitForPageLoaded(function() {
            test.assertNotExists('body.show-recommendations');
            casper.click('#enable_recommendations');
            casper.click('.account-settings-save button[type="submit"]');
        });

        casper.waitForSelector('body.show-recommendations', function() {
            // Test submitting with recommendations adds the body class.
            test.assertEqual(
                casper.getFormValues('.account-settings').enable_recommendations,
                true
            );

            // Test the recommendations tab is visible.
            test.assertVisible('.navbar [data-tab="recommended"]');
            casper.click('.account-settings-save .logout');
        });

        helpers.waitForPageLoaded(function() {
            // Test logging out removes the body class.
            test.assertNotExists('body.show-recommendations');
        });

        helpers.done(test);
    }
}));

casper.test.begin('Test settings newsletter desktop', helpers.desktopTest({
    test: function(test) {
        helpers.waitForPageLoaded(function() {
            test.assertNotVisible('.account-settings .newsletter-info');
        });

        helpers.done(test);
    }
}));
