/*
    Tests for app reviews.
*/
var helpers = require('../../lib/helpers');

function testAddReviewForm(test) {
    // Checks review form existence and validation.
    casper.waitForSelector('.add-review-form', function() {
        test.assertSelectorHasText('.char-count b', '150');
        test.assert(!helpers.checkValidity('.mkt-prompt form'));

        var slug = casper.evaluate(function() {
            return document.querySelector('.add-review-form [name="app"]').value;
        });
        test.assert(!!slug, 'Assert review form has app value');

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


casper.test.begin('Test review button hidden when logged in and cannot rate', {
    test: function(test) {
        helpers.startCasper({path: '/app/cant_rate/ratings'});

        helpers.waitForPageLoaded(function() {
            helpers.fake_login();
        });

        helpers.waitForPageLoaded(function() {
            test.assertDoesntExist('.review-button');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test sign in to rate when cannot rate', {
    test: function(test) {
        helpers.startCasper({path: '/app/cant_rate/ratings'});

        helpers.waitForPageLoaded(function() {
            casper.click('.review-button');
            helpers.fake_login();
        });

        helpers.waitForPageLoaded(function() {
            test.assertDoesntExist('.add-review-form');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test add review on app review page', {
    test: function(test) {
        helpers.startCasper({path: '/app/can_rate/ratings'});

        helpers.waitForPageLoaded(function() {
            casper.click('.review-button');
            helpers.fake_login();
        });

        testAddReviewForm(test);
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


casper.test.begin('Test edit review on review page', {
    test: function(test) {
        helpers.startCasper({path: '/app/has_rated/ratings'});

        helpers.waitForPageLoaded(function() {
           helpers.fake_login();
        });

        helpers.waitForPageLoaded(function() {
           casper.click('.review-actions [data-edit-review]');
        });

        casper.waitForSelector('.edit-review-form', function() {
            test.assertUrlMatch(/\/app\/has_rated\/ratings\/edit/);
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

        testAddReviewForm(test);
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


casper.test.begin('Test login to r? if already r? on desktop', helpers.desktopTest({
    test: function(test) {
        helpers.startCasper({path: '/app/has_rated'});

        helpers.waitForPageLoaded(function() {
            casper.click('.review-button');
            helpers.fake_login();
        });

        helpers.waitForPageLoaded(function() {
            test.assertExists('.edit-review-form');
        });

        helpers.done(test);
    }
}));


casper.test.begin('Test reviews page back to app link', helpers.tabletTest({
    test: function(test) {
        helpers.startCasper({path: '/app/has_rated/ratings'});

        helpers.waitForPageLoaded(function() {
            test.assertVisible('.back-to-app');
            casper.click('.back-to-app');
        });

        casper.waitForSelector('[data-page-type~="detail"]', function() {
            test.assertExists('.detail');
        });

        helpers.done(test);
    }
}));
