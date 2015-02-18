/*
    Tests for the Feed and Feed detail pages.
*/
var helpers = require('../lib/helpers');

var _ = require('../../node_modules/underscore');

var feedDetailPages = [
    {
        name: 'Shelf',
        path: '/feed/shelf/shelf',
    },
    {
        name: 'Shelf Description',
        path: '/feed/shelf/shelf-desc',
    },
    {
        name: 'Brand Grid',
        path: '/feed/editorial/brand-grid',
    },
    {
        name: 'Brand Listing',
        path: '/feed/editorial/brand-listing',
    },
    {
        name: 'Collection Mega',
        path: '/feed/collection/grouped',
    },
    {
        name: 'Collection Promo',
        path: '/feed/collection/coll-promo',
    },
    {
        name: 'Collection Promo Desc',
        path: '/feed/collection/coll-promo-desc',
    },
    {
        name: 'Collection Promo Background',
        path: '/feed/collection/coll-promo-bg',
    },
    {
        name: 'Collection Promo Background Desc',
        path: '/feed/collection/coll-promo-bg-desc',
    },
    {
        name: 'Collection Promo Listing',
        path: '/feed/collection/coll-listing',
    },
    {
        name: 'Collection Promo Listing Desc',
        path: '/feed/collection/coll-listing-desc',
    },
];


feedDetailPages.forEach(function(feedDetailPage) {
    // This seems similar to the app list tests, but this tests each
    // permutation of collections to make sure there are no template errors.
    casper.test.begin('Test ' + feedDetailPage.name + ' detail page', {
        test: function(test) {
            helpers.startCasper({path: feedDetailPage.path});

            casper.waitUntilVisible('.app-list', function() {
                test.assertVisible(
                    '.app-list',
                    'Check ' + feedDetailPage.name + ' page loads');
            });

            helpers.done(test);
        }
    });
});


casper.test.begin('Test Feed pagination', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            casper.click('.loadmore .button');
        });

        helpers.assertWaitForSelector(test, '.feed-item-item:nth-child(30)');

        helpers.done(test);
    }
});


casper.test.begin('Test Feed navigation and tracking events', {
    test: function(test) {
        casper.waitForSelector('.home-feed', function() {
            // Package version.
            helpers.assertUATracking(test, ['dimension15', 0]);

            casper.click('.feed-collection[data-tracking="coll-listing"] .view-all-tab');
            helpers.assertWaitForSelector(test, '.app-list');
            helpers.assertUATracking(test, [
                'View Collection',
                'click',
                'coll-listing'
            ]);

            casper.back();
        });

        casper.waitForSelector('.home-feed', function() {
            casper.click('.feed-collection[data-tracking="coll-listing"] .mkt-tile');
            helpers.assertWaitForSelector(test, '[data-page-type~="detail"]');
            helpers.assertUATracking(test, [
                'View App from Collection Element',
                'click',
                'coll-listing'
            ]);

            casper.back();
        });

        casper.waitForSelector('.home-feed', function() {
            casper.click('.featured-app');
            helpers.assertUATracking(test, 'View App from Featured App Element');

            casper.back();
        });

        casper.waitForSelector('.home-feed', function() {
            casper.click('[data-tracking="brand-grid"] .view-all-tab');
            helpers.assertWaitForSelector(test, '.app-list');
            helpers.assertUATracking(test, [
                'View Branded Editorial Element',
                'click',
                'brand-grid',
            ]);

            casper.back();
        });

        casper.waitForSelector('.home-feed', function() {
            casper.click('.feed-brand .mkt-tile');
            helpers.assertWaitForSelector(test, '[data-page-type~="detail"]');
            helpers.assertUATracking(test, 'View App from Branded Editorial Element');

            casper.back();
        });

        casper.waitForSelector('.home-feed', function() {
            casper.click('.feed-brand .mkt-tile');
            helpers.assertWaitForSelector(test, '[data-page-type~="detail"]');
            helpers.assertUATracking(test, 'View App from Branded Editorial Element');

            casper.back();
        });

        casper.waitForSelector('.home-feed', function() {
            casper.click('.op-shelf');
            casper.waitForSelector('.app-list');
            helpers.assertUATracking(test, 'View Operator Shelf Element');

            casper.waitForSelector('[data-page-type~="shelf-landing"] .mkt-tile', function() {
                casper.click('.mkt-tile');
                helpers.assertWaitForSelector(test, '[data-page-type~="detail"]');
                helpers.assertUATracking(test, 'View App from Operator Shelf Element');
            });
        });

        helpers.done(test);
    }
});
