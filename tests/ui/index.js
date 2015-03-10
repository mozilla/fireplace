var helpers = require('../lib/helpers');


casper.test.begin('Test base site', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            test.assertTitle('Firefox Marketplace');
            test.assertVisible('.wordmark');
            test.assertVisible('.header-button.settings');
            test.assertVisible('#search-q');
            test.assertVisible('.home-feed');
            test.assertDoesntExist('.mkt-tile .tray');
            test.assertNotVisible('.app-list-filters-expand-toggle');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test footer at tablet width', {
    test: function(test) {
        helpers.startCasper({viewport: 'tablet'});

        helpers.waitForPageLoaded(function() {
            test.assertVisible('#site-footer');
            test.assertNotVisible('#newsletter-footer');
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
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            casper.click('.popular .tab-link');
        });

        casper.waitForSelector('.app-list', function() {
            test.assert(helpers.filterUALogs(['send', 'pageview']).length > 0,
                        'Check page view tracked on initial navigation');
        });

        helpers.done(test);
    }
});
