var helpers = require('../lib/helpers');

casper.test.begin('Test homepage', {
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
            helpers.assertUATracking(test, [
                15,
                'Package Version',
                0
            ]);

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
casper.test.begin('Test footer at tablet width', {
    test: function(test) {
        helpers.startCasper({path: '/', viewport: 'tablet'});

        helpers.waitForPageLoaded(function() {
            test.assertVisible('#site-footer');
            test.assertNotVisible('#newsletter-footer');
        });

        helpers.done(test);
    }
});
