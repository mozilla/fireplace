casper.test.begin('Test navbar', {
    test: function(test) {
        helpers.startCasper();

        // Test everything is there.
        casper.waitForSelector('.navbar', function() {
            test.assertExists('.nav-mkt.active', 'Check navbar initialized');
            test.assertExists('.nav-mkt [data-tab="homepage"]',
                              'Check navbar items initialized');
            test.assertExists('.nav-settings:not(.active)',
                              'Check settings exists but not active.');
            test.assertExists('.nav-settings [data-tab="settings"]',
                              'Check settings items exists');
            casper.click('.nav-mkt [data-tab="categories"] a');
        });

        // Test categories navigation.
        casper.waitForSelector('[data-page-type~="categories"]', function() {
            casper.click('.nav-mkt [data-tab="recommended"] a');
        });

        // Test recommended navigation.
        casper.waitForSelector('[data-page-type~="recommended"]', function() {
            casper.click('.act-tray');
        });

        // Test go to settings navbar.
        casper.waitForSelector('.nav-settings.active', function() {
            casper.click('.nav-settings [data-tab="feedback"] a');
        });

        // Test feedback navigation.
        casper.waitUntilVisible('.feedback', function() {
            casper.click('.back-to-marketplace');
        });

        // Test back to Marketplace navbar.
        casper.waitForSelector('.nav-mkt.active', function() {
            test.assertExists('[data-page-type~=homepage]',
                              'Check we are back on homepage');
            test.assertExists('.nav-mkt.active',
                              'Check nav-mkt has active class.');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test navbar tracking events', {
    test: function(test) {
        helpers.waitForPageLoaded(function() {
            casper.click('.navbar [data-tab="popular"] a');
            helpers.assertUASendEvent(test, [
                'Nav Click',
                'click',
                'popular'
            ]);
        });

        helpers.done(test);
    }
});
