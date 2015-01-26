/*
    Tests for the app detail page.
*/
var helpers = require('../lib/helpers');

casper.test.begin('App detail tests', {
    test: function(test) {
        helpers.startCasper({path: '/app/free'});

        casper.waitForSelector('.app-reviews', function() {
            // Test we are loaded.
            test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
            test.assertNotVisible('.expand-toggle');
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
            test.assertVisible('.previews');
            test.assertExists('.previews img');

            // Test app info section.
            helpers.assertContainsText('[itemprop="description"]');
            test.assertVisible('.app-support .support-email');
            test.assertVisible('.app-support .support-url');
            test.assertVisible('.app-support .homepage');
            test.assertVisible('.app-support .privacy-policy');
            test.assertDoesntExist('.button.manage');
            test.assertDoesntExist('.button.reviewer');
        });

        helpers.done(test);
    }
});


casper.test.begin('App detail previews tests', {
    test: function(test) {
        helpers.startCasper({path: '/app/abc'});

        casper.waitForSelector('.previews img', function() {
            casper.click('.previews');
            casper.click('.previews li:first-child');
            casper.click('.previews li:first-child .screenshot');
            casper.click('.previews li:first-child .screenshot img');
        });

        casper.waitForSelector('#lightbox.show', function() {
            test.assertExists('#lightbox.show', 'Lightbox is visible');
            casper.back();
        });

        casper.waitWhileVisible('#lightbox', function() {
            test.assertNotVisible('#lightbox', 'Lightbox should be invisible');
        });

        helpers.done(test);
    }
});



casper.test.begin('App detail tests for packaged apps', {
    test: function(test) {
        helpers.startCasper({path: '/app/packaged'});
        helpers.waitForPageLoaded(function() {
            test.assertUrlMatch(/\/app\/packaged/);
            test.assertSelectorHasText('.package-version', 'Latest version: 1.0');
        });
        helpers.done(test);
    }
});


casper.test.begin('App detail tests for paid apps', {
    test: function(test) {
        helpers.startCasper({path: '/app/paid'});
        helpers.waitForPageLoaded(function() {
            test.assertSelectorHasText('.mkt-tile .install em', '$0.99');
        });
        helpers.done(test);
    }
});


casper.test.begin('App detail tests as a developer', {
    test: function(test) {
        helpers.startCasper({path: '/app/developed'});

        helpers.waitForPageLoaded(function() {
            helpers.fake_login();
            test.assertUrlMatch(/\/app\/developed/);

            // "Edit Listing" button.
            test.assertExists('.button.manage');
            // "Approve/Reject" / "Review History" button.
            test.assertDoesntExist('.button.reviewer');
        });

        helpers.done(test);
    }
});


casper.test.begin('App detail tests as a reviewer', {
    test: function(test) {
        helpers.startCasper({path: '/app/developed'});

        helpers.waitForPageLoaded(function() {
            casper.evaluate(function() {
                console.log('[phantom] Giving user "reviewer" permissions');
                window.require('user').update_permissions({reviewer: true});
                require('views').reload();
            });

            test.assertExists('.button.manage');
            test.assertExists('.button.reviewer');
        });

        helpers.done(test);
    }
});


casper.test.begin('App detail reviews tests if user has not rated', {
    setUp: helpers.setUpDesktop,
    tearDown: helpers.tearDown,
    test: function(test) {
        helpers.startCasper({path: '/app/can_rate'});

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


casper.test.begin('App detail reviews tests if user has rated', {
    setUp: helpers.setUpDesktop,
    tearDown: helpers.tearDown,
    test: function(test) {
        helpers.startCasper({path: '/app/has_rated'});

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
