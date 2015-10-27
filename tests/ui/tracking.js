casper.test.begin('Test UA logged in dimension set', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            helpers.fake_login();
        });

        casper.waitForSelector('.logged-in', function() {
            helpers.assertUASetSessionVar(test, ['dimension1', true]);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA site section dimension set', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            helpers.assertUASetSessionVar(test, ['dimension3', 'Consumer']);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA platform dimension set', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            var platform = casper.evaluate(function() {
                return window.require('core/capabilities').device_type();
            });
            helpers.assertUASetSessionVar(test, ['dimension4', platform]);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA region dimension set', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            // Provided by consumer_info from the mock API.
            helpers.assertUASetSessionVar(test, ['dimension11', 'us']);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA region dimension set specified region', {
    test: function(test) {
        helpers.startCasper('/?region=br');

        helpers.waitForPageLoaded(function() {
            helpers.assertUASetSessionVar(test, ['dimension11', 'br']);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA package dimension set', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            helpers.assertUASetSessionVar(test, ['dimension15', 0]);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA pageview on initial navigation', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        helpers.waitForPageLoaded(function() {
            casper.click('.global-nav-menu-desktop .popular');
        });

        casper.waitForSelector('.app-list', function() {
            test.assert(helpers.filterUALogs(['send', 'pageview']).length > 0,
                        'Check page view tracked on initial navigation');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA pageview on unload', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            casper.evaluate(function() {
                window.require('core/z').win.trigger('unload');
            });

            test.assert(helpers.filterUALogs(['send', 'pageview']).length > 0,
                        'Check page view tracked on unload');
        });

        helpers.done(test);
    }
});
