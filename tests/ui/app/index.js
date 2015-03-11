/*
    Tests for the app detail page.
*/
var appList = require('../../lib/app_list');
var helpers = require('../../lib/helpers');


casper.test.begin('Test app detail', {
    test: function(test) {
        helpers.startCasper({path: '/app/free'});

        casper.waitForSelector('.app-reviews', function() {
            // Test we are loaded.
            test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
            test.assertNotVisible('.app-list-filters-expand-toggle');
            test.assertSelectorDoesntHaveText('.mkt-tile [itemprop="name"]',
                                              'Loading...');
            test.assertSelectorDoesntHaveText('.mkt-tile .install em',
                                              'Loading...');

            // Test app header section.
            test.assertVisible('.mkt-tile .icon');
            helpers.assertContainsText('.mkt-tile [itemprop="name"]');
            helpers.assertContainsText('.mkt-tile [itemprop="creator"]');
            var href = this.getElementAttribute('.mkt-tile .author a', 'href');
            test.assert(href.indexOf('/search?author') !== -1);
            test.assertSelectorHasText('.mkt-tile .install em', 'Free');
            test.assertVisible('.mkt-tile .install');
            test.assertVisible('.previews-tray');
            test.assertExists('.previews-tray img');

            // Test app info section.
            helpers.assertContainsText('[itemprop="description"]');
            test.assertVisible('.app-support .support-email');
            test.assertVisible('.app-support .support-url');
            test.assertVisible('.app-support .homepage');
            test.assertVisible('.app-support .privacy-policy');
            test.assertDoesntExist('.button.manage');
            test.assertDoesntExist('.button.reviewer');
            test.assertDoesntExist('.button.view-stats');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test app detail previews', {
    test: function(test) {
        helpers.startCasper({path: '/app/abc'});

        casper.waitForSelector('.previews-tray img', function() {
            casper.click('.previews-tray');
            casper.click('.previews-tray li:first-child');
            casper.click('.previews-tray li:first-child .screenshot');
            casper.click('.previews-tray li:first-child .screenshot img');
        });

        casper.waitForSelector('#lightbox.show', function() {
            test.assertExists('#lightbox.show', 'Lightbox is visible');
            casper.back();
        });

        casper.waitWhileVisible('#lightbox', function() {
            test.assertNotVisible('#lightbox', 'Lightbox should be invisible');

            helpers.assertUASendEvent(test, [
                'App view interactions',
                'click',
                'Screenshot view'
            ]);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test app detail description toggle', {
    test: function(test) {
        helpers.startCasper({path: '/app/abc'});

        casper.waitForSelector('.description-wrapper.truncated', function() {
            casper.click('.description-wrapper + .truncate-toggle');

            test.assertNotExists('.description-wrapper.truncated');

            helpers.assertUASendEvent(test, [
                'App view interactions',
                'click',
                'Toggle description'
            ]);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test app detail description shown when possible', {
    test: function(test) {
        helpers.startCasper({path: '/app/abc', viewport: 'desktop'});

        casper.waitForSelector('.description-wrapper', function() {
            // The truncated class is removed when the content fits.
            test.assertNotExists('.description-wrapper.truncated');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test app detail tests for packaged apps', {
    test: function(test) {
        helpers.startCasper({path: '/app/packaged'});
        helpers.waitForPageLoaded(function() {
            test.assertUrlMatch(/\/app\/packaged/);
            test.assertExists('.package-last-updated h3');
            // Date is either in Y-m-d format or in Month, Day, Year
            // format depending on what is available. We simply try to parse it
            // to see if it's a valid date.
            test.assertTruthy(
                Date.parse(casper.fetchText('.package-last-updated p')),
               'Last updated text is a valid date');
        });
        helpers.done(test);
    }
});


casper.test.begin('Test app detail for paid apps', {
    test: function(test) {
        helpers.startCasper({path: '/app/paid'});
        helpers.waitForPageLoaded(function() {
            test.assertSelectorHasText('.mkt-tile .install em', '$3.50');
            // helpers.assertUASendEventPageVar(test, 'dimension10', 'paid');
        });
        helpers.done(test);
    }
});


casper.test.begin('Test app detail as a developer', {
    test: function(test) {
        helpers.startCasper({path: '/app/developed'});

        helpers.waitForPageLoaded(function() {
            helpers.fake_login();
            test.assertUrlMatch(/\/app\/developed/);

            // "Edit Listing" button.
            test.assertExists('.button.manage');
            // Stats buttons.
            test.assertExists('.button.view-stats');
            // "Approve/Reject" / "Review History" button.
            test.assertDoesntExist('.button.reviewer');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test app detail as a reviewer', {
    test: function(test) {
        helpers.startCasper({path: '/app/developed'});

        helpers.waitForPageLoaded(function() {
            casper.evaluate(function() {
                console.log('[phantom] Giving user "reviewer" permissions');
                window.require('core/user').update_permissions({reviewer: true});
                require('core/views').reload();
            });

            test.assertExists('.button.manage');
            test.assertExists('.button.reviewer');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test app detail as a user with the stats permission', {
    test: function(test) {
        helpers.startCasper({path: '/app/abc'});

        helpers.waitForPageLoaded(function() {
            casper.evaluate(function() {
                console.log('[phantom] Giving user "stats" permission');
                window.require('core/user').update_permissions({stats: true});
                require('core/views').reload();
            });

            test.assertExists('.button.view-stats');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test app detail reviews if user has not rated', {
    test: function(test) {
        helpers.startCasper({path: '/app/can_rate', viewport: 'desktop'});

        casper.waitForSelector('.app-reviews', function() {
            test.assertSelectorHasText('.review-button', 'Sign in to review');
            helpers.fake_login();
        });
        casper.waitForSelector('.review-button', function() {
            test.assertSelectorHasText('.review-button', 'Write a review');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test app detail reviews if user has rated', {
    test: function(test) {
        helpers.startCasper({path: '/app/has_rated', viewport: 'desktop'});

        helpers.waitForPageLoaded(function() {
            test.assertSelectorHasText('.review-button', 'Sign in to review');
            helpers.fake_login();
        });

        casper.waitForSelector('.review-button[data-edit-review]', function() {
            test.assertSelectorHasText('[data-edit-review]', 'Edit your review');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test app detail mobile previews', {
    test: function(test) {
        helpers.startCasper({path: '/app/something'});

        helpers.waitForPageLoaded(function() {
            test.assertVisible('.previews-content');
            test.assertVisible('.previews-bars');
            test.assertNotVisible('.previews-tray .arrow-button');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test app detail desktop previews', {
    test: function(test) {
        helpers.startCasper({path: '/app/something', viewport: 'desktop'});

        helpers.waitForPageLoaded(function() {
            test.assertVisible('.previews-tray .previews-desktop-content');
            test.assertVisible('.previews-tray .previews-bars');
            test.assertVisible('.previews-tray .arrow-button');

            // Check that the first image is visible, if the image takes too
            // long to load this test will be skipped.
            var imageSelector = '.previews-tray li:first-child img';
            var imageUrl = casper.getElementAttribute(imageSelector, 'src');
            casper.waitForResource(imageUrl, function() {
                test.assertVisible(imageSelector);
            }, function() {
                test.skip(1, 'did not load image in time, skipping');
            });
        });

        helpers.done(test);
    }
});

casper.test.begin('Test app detail page view', {
    test: function(test) {
        helpers.startCasper('/app/lol');

        var app;
        helpers.waitForPageLoaded(function() {
            app = appList.getAppData('.install');
            casper.click('.wordmark');
        });

        casper.waitWhileSelector('[data-page-type~="detail"]', function() {
            var dims = helpers.filterUALogs(['send', 'pageview'])[0][2];
            test.assertEquals(dims.dimension6, app.name);
            test.assertEquals(dims.dimension7, app.id + '');
            test.assertEquals(dims.dimension8, app.author);
            test.assertEquals(dims.dimension9, 'direct');
            test.assertEquals(dims.dimension10, 'free');
        });

        helpers.done(test);
    }
});
