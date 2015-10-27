casper.test.begin('Test settings', {
    test: function(test) {
        helpers.startCasper({path: '/settings'});

        casper.waitUntilVisible('.account-settings .persona', function() {
            test.assertNotVisible('.account-settings .logout');
            test.assertNotVisible('.account-settings-save button[type="submit"]');
            test.assertNotVisible('.account-settings .settings-email');
            // This elements are not directly hidden which doesn't play nicely
            // with test.assertNotVisible. See https://github.com/mozilla/fireplace/pull/1050#discussion-diff-25678912
            // for the discussion. This may work in casperjs > 1.1.0-beta3.
            test.assertExists('.account-settings .display-name input[name="display_name"]');
            test.assertNotVisible('.account-settings .display-name');
            test.assertExists('.account-settings .recommendations input[name="enable_recommendations"]');
            test.assertNotVisible('.account-settings .recommendations');
            helpers.fake_login();
        });

        casper.waitUntilVisible('.account-settings .logout', function() {
            test.assertNotVisible('.account-settings .persona');
            test.assertVisible('.account-settings-save button[type="submit"]');
            test.assertVisible('.account-settings .settings-email');
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

casper.test.begin('Test settings recommendations', {
    test: function(test) {
        helpers.startCasper({path: '/settings', viewport: 'desktop'});

        helpers.waitForPageLoaded(function() {
            helpers.fake_login();
        });

        function toggleRecommendations() {
            casper.click('#enable_recommendations');
            casper.click('.account-settings-save button[type="submit"]');
        }

        helpers.waitForLoggedIn(function() {
            test.assertNotExists('body.show-recommendations');
            toggleRecommendations();
        });

        casper.waitForSelector('body.show-recommendations', function() {
            // Test submitting with recommendations adds the body class.
            test.assertEqual(
                casper.getFormValues('.account-settings')
                      .enable_recommendations,
                true
            );

            // Test the recommendations tab is visible.
            test.assertVisible('.recommended');

            // Test that disabling recommendations hides the tab.
            toggleRecommendations();
        });

        casper.waitForSelector('body:not(.show-recommendations)', function() {
            // Test the body class has been removed and the tab is hidden.
            test.assertNotExists('body.show-recommendations');
            test.assertNotVisible('.recommended');

            // Re-enable recommendations.
            toggleRecommendations();
        });

        // Sign out.
        casper.thenClick('.account-settings-save .logout', function() {
            // Test logging out removes the body class.
            test.assertNotExists('body.show-recommendations');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test settings newsletter desktop', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        helpers.waitForPageLoaded(function() {
            test.assertNotVisible('.account-settings .newsletter-info');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test settings hide logout if native FxA', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            helpers.fake_login();
        });

        helpers.waitForLoggedIn(function() {
            test.assertVisible('.logout');
            casper.evaluate(function() {
                document.querySelector('body').classList.add('native-fxa');
            });
            test.assertNotVisible('.account-settings .logout');
        });

        helpers.done(test);
    }
});
