casper.test.begin('Test base site', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            test.assertTitle('Firefox Marketplace');
            test.assertVisible('.wordmark');
            test.assertVisible('.header-button.settings');
            test.assertVisible('#search-q');
            test.assertVisible('.feed-home');
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

            var games = casper.evaluate(function() {
                return window.require('core/l10n').gettext('Games');
            });
            test.assertNotEquals(games, 'Games');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test that the banner is first on desktop', {
    test: function(test) {
        helpers.startCasper('/debug', {viewport: 'desktop'});

        helpers.waitForPageLoaded();
        casper.thenClick('#enable-mkt-nav');
        casper.waitForSelector('.mkt-nav--wrapper');
        casper.then(function() {
            test.assertExists('#banners ~ #mkt-nav--site-header');
        });

        helpers.done(test);
    },
});

casper.test.begin('Test that the banner is last on mobile', {
    test: function(test) {
        helpers.startCasper('/debug');

        helpers.waitForPageLoaded();
        casper.thenClick('#enable-mkt-nav');
        casper.waitForSelector('.mkt-nav--wrapper');
        casper.then(function() {
            test.assertExists('#mkt-nav--site-header ~ main mkt-select.compat-filter');
            test.assertExists('#mkt-nav--site-header ~ main #banners');
            test.assertExists('mkt-select.compat-filter + #banners');
        });

        helpers.done(test);
    },
});

casper.test.begin('Test that the banner is last on desktop without mkt-nav', {
    test: function(test) {
        helpers.startCasper('/debug', {viewport: 'desktop'});

        helpers.waitForPageLoaded();
        casper.then(function() {
            test.assertExists('#site-header ~ main #site-nav');
            test.assertExists('#site-header ~ main #banners');
            test.assertExists('#site-nav + #banners');
        });

        helpers.done(test);
    },
});

casper.test.begin('Test that there is only ever one platform select', {
    test: function(test) {
        function reloadChrome() {
        }

        helpers.startCasper('/debug', {viewport: 'desktop'});

        helpers.waitForPageLoaded();
        casper.thenClick('#enable-mkt-nav');
        casper.waitForSelector('.mkt-nav--wrapper');

        casper.then(function() {
            casper.evaluate(function() {
                window.require('core/z').page.trigger('reload_chrome');
            });
            casper.wait(100);
        });

        casper.then(function() {
            var platformSelectCount = casper.evaluate(function() {
                return document.querySelectorAll('mkt-select.compat-filter')
                               .length;
            });
            test.assertEqual(platformSelectCount, 1);
        });

        helpers.done(test);
    },
});
