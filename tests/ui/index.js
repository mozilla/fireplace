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


casper.test.begin('Test l10n initialized', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            var lang = casper.evaluate(function() {
                return window.navigator.l10n.language;
            });
            test.assertEquals(lang, 'en-US');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test l10n initialized for non en-US', {
    test: function(test) {
        helpers.startCasper('/?lang=es');

        helpers.waitForPageLoaded(function() {
            var lang = casper.evaluate(function() {
                return window.navigator.l10n.language;
            });
            test.assertEquals(lang, 'es');
        });

        helpers.done(test);
    }
});
