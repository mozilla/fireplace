/*
    Tests for app reviews.
*/
var helpers = require('../lib/helpers');

function testAddReviewForm(test) {
    // Checks review form existence and validation.
    casper.waitForSelector('.mkt-prompt form', function() {
        test.assertSelectorHasText('.char-count b', '150');
        test.assert(!helpers.checkValidity('.mkt-prompt form'));

        var slug = casper.evaluate(function() {
            return document.querySelector('[name="app"]').value;
        });
        test.assert(!!slug, 'Assert review form has app value');

        casper.fill('.mkt-prompt form', {'body': 'test'});
    });

    casper.waitForText('146', function() {
        // Test form validity.
        test.assert(!helpers.checkValidity('.mkt-prompt form'));

        casper.click('.stars input[value="3"]');
        test.assert(helpers.checkValidity('.mkt-prompt form'));
        casper.click('.mkt-prompt form [type="submit"]');
    });

    casper.waitWhileVisible('.mkt-prompt form', function() {
        // Post review stuff.
        helpers.assertUATracking(test, [
            'App view interactions',
            'click',
            'Successful review'
        ]);
    });
}

function testEditReviewForm(test) {
    // Checks review form existence and validation.
    casper.waitForSelector('.mkt-prompt form', function() {
        test.assert(helpers.checkValidity('.mkt-prompt form'));

        var slug = casper.evaluate(function() {
            return document.querySelector('[name="app"]').value;
        });
        test.assert(!!slug, 'Assert review form has app value');

        casper.fill('.mkt-prompt form', {'body': 'test'});
    });

    casper.waitForText('146', function() {
        // Test form validity.
        test.assert(helpers.checkValidity('.mkt-prompt form'));
        casper.click('.stars input[value="1"]');
        casper.click('.mkt-prompt form [type="submit"]');
    });

    casper.waitForSelector('[data-page-type~="detail"]');
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
            testEditReviewForm(test);
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
            testEditReviewForm(test);
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


casper.test.begin('Test unrated app hidden review listing link', {
    test: function(test) {
        helpers.startCasper({path: '/app/unrated'});
        helpers.waitForPageLoaded(function() {
            test.assertElementCount('.review-buttons .button', 1);
            test.assertElementCount('.review-buttons .review-button', 1);
        });
        helpers.done(test);
    }
});


casper.test.begin('Test unrated app no link on detail page', {
    test: function(test) {
        helpers.startCasper({path: '/app/unrated'});
        helpers.waitForPageLoaded(function() {
            test.assertDoesntExist('a.rating-link');
            test.assertExists('span.rating-link');
        });
        helpers.done(test);
    }
});


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


casper.test.begin('Test delete review', {
    test: function(test) {
        helpers.startCasper({path: '/app/has_rated/ratings'});

        var reviewCount;
        var reviewCountModelCache;
        casper.waitForSelector('.reviews-listing', function() {
            reviewCount = casper.evaluate(function() {
                return document.querySelectorAll('.review').length;
            });
            reviewCountModelCache = casper.evaluate(function() {
                return window.require('models')('app').lookup('has_rated').ratings.count;
            });

            casper.click('.review-actions [data-action="delete"]');
        });

        casper.waitWhileSelector('.review-actions [data-action="delete"]', function() {
            // Test review removed from page.
            test.assertElementCount('.review', reviewCount - 1);

            // Test busted from model cache.
            var newReviewCountModelCache = casper.evaluate(function() {
                return window.require('models')('app').lookup('has_rated').ratings.count;
            });
            test.assert(newReviewCountModelCache == reviewCountModelCache - 1,
                        'App model cache decrement review count');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test login to review on desktop on review page',
helpers.desktopTest({
    test: function(test) {
        helpers.startCasper({path: '/app/can_rate/ratings'});

        helpers.waitForPageLoaded(function() {
            casper.click('.review-button');
            helpers.fake_login();
        });

        helpers.waitForPageLoaded(function() {
            test.assertExists('.add-review-form');
            test.assertDoesntExist('.edit-review-form');
        });

        helpers.done(test);
    }
}));


casper.test.begin('Test login to review if already reviewed on desktop detail',
helpers.desktopTest({
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
