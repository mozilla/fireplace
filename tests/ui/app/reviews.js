/*
    Tests for app reviews.
*/
var helpers = require('../lib/helpers');

function testAddReviewModal(test) {
    casper.waitForSelector('.add-review-form', function() {
        test.assertSelectorHasText('.char-count b', '150');
        test.assert(!helpers.checkValidity('.mkt-prompt form'));
        casper.fill('.add-review-form', {'body': 'test'});
    });

    casper.waitForText('146', function() {
        // Test form validity.
        test.assert(!helpers.checkValidity('.mkt-prompt form'));

        casper.click('.stars input[value="3"]');
        test.assert(helpers.checkValidity('.mkt-prompt form'));
        casper.click('.add-review-form [type="submit"]');
    });

    casper.waitWhileVisible('.add-review-form', function() {
        // Post review stuff.
        helpers.assertUATracking(test, [
            'App view interactions',
            'click',
            'Successful review'
        ]);
    });
}


casper.test.begin('Test app review page', {
    test: function(test) {
        helpers.startCasper({path: '/app/has_rated/ratings'});

        helpers.waitForPageLoaded(function() {
            test.assertVisible('.review');
            test.assertVisible('.review .stars');
            test.assertVisible('.review .review-author');
            test.assertVisible('.review .review-body');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test flag review on app review page', {
    test: function(test) {
        helpers.startCasper({path: '/app/can_rate/ratings'});
        helpers.fake_login();

        casper.waitForSelector('.review-button', function() {
            casper.click('.review-actions .flag');
        });

        casper.waitForUrl(/\/app\/can_rate\/ratings/, function() {
            helpers.assertContainsText('.review-button');
            test.assertVisible('.flag-review-form ul li');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test add review on app review page', {
    test: function(test) {
        helpers.startCasper({path: '/app/can_rate'});
        helpers.fake_login();

        helpers.waitForPageLoaded(function() {
            casper.click('.review-button');
            helpers.fake_login();
        });

        testAddReviewModal(test);
        helpers.done(test);
    }
});


casper.test.begin('Test add ratings page w/o login redirects to app detail', {
    test: function(test) {
        helpers.startCasper({path: '/app/foo/ratings/add'});
        helpers.waitForPageLoaded(function() {
            test.assertUrlMatch(/\/app\/foo$/);
        });
        helpers.done(test);
    }
});


casper.test.begin('Test edit ratings page w/o login redirects to app detail', {
    test: function(test) {
        helpers.startCasper({path: '/app/foo/ratings/edit'});
        helpers.waitForPageLoaded(function() {
            test.assertUrlMatch(/\/app\/foo$/);
        });
        helpers.done(test);
    }
});


casper.test.begin('Test edit review on detail page', {
    test: function(test) {
        helpers.startCasper({path: '/app/has_rated'});

        helpers.waitForPageLoaded(function() {
           helpers.fake_login();
        });

        helpers.waitForPageLoaded(function() {
           casper.click('.review-button');
        });

        casper.waitForSelector('.edit-review-form', function() {
            test.assertUrlMatch(/\/app\/has_rated\/ratings\/edit/);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test add rating on detail page on desktop', {
    setUp: helpers.setUpDesktop,
    tearDown: helpers.tearDown,
    test: function(test) {
        helpers.startCasper({path: '/app/can_rate'});

        helpers.waitForPageLoaded(function() {
            test.assertSelectorHasText('.review-button', 'Sign in to review');
            casper.click('.review-button');
            helpers.fake_login();
        });

        testAddReviewModal(test);
        helpers.done(test);
    }
});


casper.test.begin('Test edit rating on detail page on desktop', {
    setUp: helpers.setUpDesktop,
    tearDown: helpers.tearDown,
    test: function(test) {
        helpers.startCasper({path: '/app/has_rated'});
        helpers.waitForPageLoaded(function() {
            helpers.fake_login();
        });
        helpers.waitForPageLoaded(function() {
            casper.click('.review-button');
        });
        casper.waitForSelector('.edit-review-form');
        helpers.done(test);
    }
});
