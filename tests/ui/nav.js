function navSetUp(cb) {
    helpers.waitForPageLoaded(function() {
        casper.waitForSelector('mkt-nav', cb);
    });
}


casper.test.begin('Test more menu toggle', {
    test: function(test) {
        helpers.startCasper();

        navSetUp(function() {
            // Nav shown.
            test.assertVisible('.global-nav');

            // More menu opens when clicked.
            casper.click('.global-nav-menu [data-nav-type="more"]');
            test.assertExists('.more-menu-overlay.overlay-visible');

            // It closes when we click the close button.
            casper.click('.overlay-close');
            test.assertDoesntExist('.more-menu-overlay.overlay-visible');

            // It closes when click link.
            casper.click('.global-nav-menu [data-nav-type="more"]');
            casper.click('.nav-more-menu li:first-child a');
            test.assertDoesntExist('.more-menu-overlay.overlay-visible');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test mkt-nav navigation', {
    test: function(test) {
        helpers.startCasper();

        navSetUp(function() {
            casper.click('.global-nav-menu [data-nav-type="apps"]');
        });

        casper.waitForSelector('[data-page-type~="nav-apps"]', function() {
            test.assertExists('.app-list');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test back button', {
    test: function(test) {
        helpers.startCasper('/app/foo');

        navSetUp(function() {
            casper.click('.header-back-btn');
        });

        casper.waitForSelector('[data-page-type~="homepage"]');

        helpers.done(test);
    }
});


casper.test.begin('Test header back button not on desktop', {
    test: function(test) {
        helpers.startCasper('/app/foo', {viewport: 'desktop'});

        navSetUp(function() {
            test.assertVisible('.global-nav-menu-desktop');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test settings navigation', {
    test: function(test) {
        helpers.startCasper();

        navSetUp(function() {
            casper.click('.global-nav-menu [data-nav-type="more"]');

            test.assertVisible('.more-menu-feedback');
            test.assertVisible('.more-menu-register');
            test.assertVisible('.more-menu-sign-in');
            test.assertNotVisible('.more-menu-settings');
            test.assertNotVisible('.more-menu-my-apps');
            test.assertNotVisible('.more-menu-sign-out');

            casper.click('.more-menu-feedback a');
        });

        casper.waitForSelector('[data-page-type~="feedback"]', function() {
            casper.click('.more-menu-sign-in a');
            helpers.fake_login();
        });

        casper.waitForSelector('.logged-in', function() {
            casper.click('.more-menu-my-apps a');
        });

        casper.waitForSelector('[data-page-type~="purchases"]', function() {
            casper.click('.more-menu-settings a');
        });

        casper.waitForSelector('[data-page-type~="settings"]', function() {
            casper.click('.more-menu-sign-out a');
        });

        casper.waitWhileSelector('.logged-in');

        helpers.done(test);
    }
});
