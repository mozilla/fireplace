function navSetUp(cb) {
    helpers.waitForPageLoaded(function() {
        casper.waitForSelector('mkt-nav', cb);
    });
}


casper.test.begin('Test mkt-nav toggle', {
    test: function(test) {
        helpers.startCasper();

        navSetUp(function() {
            // Hidden at first.
            test.assertDoesntExist('.mkt-nav--visible mkt-nav');

            // It opens when click toggle.
            casper.click('mkt-nav-toggle');
            test.assertExists('.mkt-nav--visible mkt-nav');

            // It closes when click toggle.
            casper.click('mkt-nav-toggle');
            test.assertDoesntExist('.mkt-nav--visible mkt-nav');

            // It closes when click link.
            casper.click('mkt-nav-toggle');
            test.assertExists('.mkt-nav--visible mkt-nav');
            casper.click('[data-mkt-nav--item="popular"] a');
            test.assertDoesntExist('.mkt-nav--visible mkt-nav');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test mkt-nav navigation', {
    test: function(test) {
        helpers.startCasper();

        navSetUp(function() {
            casper.click('mkt-nav-toggle');
            test.assertExists('[data-mkt-nav--item="homepage"] .mkt-nav--active');
            casper.click('[data-mkt-nav--item="new"] a');
        });

        casper.waitForSelector('[data-page-type~="new"]', function() {
            test.assertExists('[data-mkt-nav--item="new"] .mkt-nav--active');
            casper.click('mkt-nav-toggle');
            casper.click('[data-mkt-nav--item="popular"] a');
        });

        casper.waitForSelector('[data-page-type~="popular"]', function() {
            test.assertExists('[data-mkt-nav--item="popular"] .mkt-nav--active');
            casper.click('mkt-nav-toggle');
            casper.click('[data-mkt-nav--item="homepage"] a');
        });

        casper.waitForSelector('[data-page-type~="homepage"]', function() {
            test.assertExists('[data-mkt-nav--item="homepage"] .mkt-nav--active');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test mkt-nav subnavs', {
    test: function(test) {
        helpers.startCasper();

        navSetUp(function() {
            casper.evaluate(function() {
                document.body.classList.remove('mkt-nav--subnav-visible');
            });

            casper.click('mkt-nav-toggle');
            test.assertDoesntExist('.mkt-nav--subnav-visible');

            casper.click('mkt-nav [data-mkt-nav--item="categories"] a');
            test.assertExists('.mkt-nav--subnav-visible');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test mkt-nav back', {
    test: function(test) {
        helpers.startCasper('/app/foo');

        navSetUp(function() {
            casper.click('.mkt-header--back');
        });

        casper.waitForSelector('[data-page-type~="homepage"]');

        helpers.done(test);
    }
});


casper.test.begin('Test mkt-nav back not on desktop', {
    test: function(test) {
        helpers.startCasper('/app/foo', {viewport: 'desktop'});

        navSetUp(function() {
            test.assertNotVisible('.mkt-header--back');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test mkt-nav settings navigation', {
    test: function(test) {
        helpers.startCasper();

        navSetUp(function() {
            casper.click('mkt-nav-toggle');

            test.assertVisible('[data-mkt-nav--item="feedback"]');
            test.assertVisible('[data-mkt-nav--item="register"]');
            test.assertVisible('[data-mkt-nav--item="login"]');
            test.assertNotVisible('[data-mkt-nav--item="settings"]');
            test.assertNotVisible('[data-mkt-nav--item="purchases"]');
            test.assertNotVisible('[data-mkt-nav--item="logout"]');

            casper.click('[data-mkt-nav--item="feedback"] a');
        });

        casper.waitForSelector('[data-page-type~="feedback"]', function() {
            casper.click('[data-mkt-nav--item="login"] a');
            helpers.fake_login();
        });

        casper.waitForSelector('.logged-in', function() {
            casper.click('[data-mkt-nav--item="purchases"] a');
        });

        casper.waitForSelector('[data-page-type~="purchases"]', function() {
            casper.click('[data-mkt-nav--item="settings"] a');
        });

        casper.waitForSelector('[data-page-type~="settings"]', function() {
            casper.click('[data-mkt-nav--item="logout"] a');
        });

        casper.waitWhileSelector('.logged-in');

        helpers.done(test);
    }
});
