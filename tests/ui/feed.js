/*
    Tests for the Feed and Feed detail pages.
*/
var constants = helpers.load('constants');

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
            casper.click(constants.LOADMORE_SEL);
        });

        helpers.assertWaitForSelector(test, '.feed-item-item:nth-child(30)');

        helpers.done(test);
    }
});


casper.test.begin('Test Feed navigation and tracking events', {
    test: function(test) {
        casper.waitForSelector('.feed-home', function() {
            casper.click('.feed-collection[data-tracking="coll-listing"] .view-all-tab');
            helpers.assertWaitForSelector(test, '.app-list');
            helpers.assertUASendEvent(test, [
                'View Collection',
                'click',
                'coll-listing'
            ]);

            casper.back();
        });

        casper.waitForSelector('.feed-home', function() {
            casper.click('[data-tracking="brand-grid"] .brand-header');
            helpers.assertUASendEvent(test, [
                'View Branded Editorial Element',
                'click',
                'brand-grid',
            ]);

            casper.back();
        });

        casper.waitForSelector('.feed-home', function() {
            casper.click('.feed-brand .mkt-tile');
            helpers.assertWaitForSelector(test, '[data-page-type~="detail"]');
            helpers.assertUASendEvent(test, 'View App from Branded Editorial Element');

            casper.back();
        });

        casper.waitForSelector('.feed-home', function() {
            casper.click('.feed-brand .mkt-tile');
            helpers.assertWaitForSelector(test, '[data-page-type~="detail"]');
            helpers.assertUASendEvent(test, 'View App from Branded Editorial Element');

            casper.back();
        });

        casper.waitForSelector('.feed-home', function() {
            casper.click('.op-shelf');
            casper.waitForSelector('.app-list');
            helpers.assertUASendEvent(test, 'View Operator Shelf Element');

            casper.waitForSelector('[data-page-type~="shelf-landing"] .mkt-tile', function() {
                casper.click('.mkt-tile');
                helpers.assertWaitForSelector(test, '[data-page-type~="detail"]');
                helpers.assertUASendEvent(test, 'View App from Operator Shelf Element');
            });
        });

        helpers.done(test);
    }
});


casper.test.begin('Test list layout install buttons enabled', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            test.assertDoesntExist('.feed-brand.feed-layout-list .install[disabled]',
                                   'Check all install buttons enabled for list');
            casper.click('.feed-brand.feed-layout-list .mkt-tile:first-child .install');
        });

        casper.waitForSelector('.feed-brand.feed-layout-list .mkt-tile:first-child .launch');

        helpers.done(test);
    }
});


casper.test.begin('Test brand does not show collection app icons', {
    test: function(test) {
        helpers.startCasper('/feed/editorial/brand-grid');

        helpers.waitForPageLoaded(function() {
            test.assertExists('[data-brand-landing]');
            test.assertDoesntExist('.feed-landing-app-icons');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test clicking on brand sets correct src', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            casper.click('[data-tracking="brand-grid"] .brand-header');
        });

        casper.waitForSelector('[data-brand-landing]', function() {
            test.assertUrlMatch(
                /feed\/editorial\/brand-grid\?src=branded-editorial-element/);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test Feed pagination cache rewrite', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            casper.click(constants.LOADMORE_SEL);
        });

        casper.waitForSelector('.feed-item-item:nth-child(15)', function() {
            casper.click('.mkt-tile');
        });

        casper.waitForSelector('[data-page-type~="detail"]', function() {
            casper.back();
        });

        casper.waitForSelector('[data-page-type~="homepage"]', function() {
            test.assertExists('.feed-item-item:nth-child(15)');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test Feed endpoint', {
    test: function(test) {
        var resources = [];
        casper.on('resource.received', function(resource) {
            resources.push(resource);
        });

        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            helpers.assertAPICallWasMade('/api/v2/feed/get/', {
                cache: '21600',
                dev: 'desktop',
                lang: 'en-US',
                limit: '10',
                region: 'us',
                vary: '0',
            });

            casper.click('.global-nav-menu [data-nav-type="apps"]');
        });

        casper.waitForSelector('.app-list', function() {
            helpers.selectOption('#compat-filter', 'firefoxos');
            casper.click('.mkt-wordmark');
        });

        casper.waitForSelector('.feed-home', function() {
            resources.forEach(function(resource) {
                var target = resource.url;
                var url = target.split('?')[0];
                var params = target.split('?')[1];

                var baseUrl = casper.evaluate(function() {
                    return require('core/settings').api_url;
                });

                if (baseUrl + '/api/v2/feed/get/' == url &&
                    utils.equals(helpers.parseQueryString(params), {
                        cache: '21600',
                        lang: 'en-US',
                        limit: '10',
                        region: 'us',
                        vary: '0',
                        dev: 'firefoxos'
                    })) {
                    test.fail('Feed resource with dev=firefoxos was found');
                }
            });
        });

        helpers.done(test);
    }
});


casper.test.begin('Test Feed collection endpoint', {
    test: function(test) {
        var resources = [];
        casper.on('resource.received', function(resource) {
            resources.push(resource);
        });

        helpers.startCasper('/feed/collection/grouped');

        helpers.waitForPageLoaded(function() {
            helpers.assertAPICallWasMade(
                '/api/v2/fireplace/feed/collections/grouped/', {
                    cache: '1',
                    dev: 'desktop',
                    lang: 'en-US',
                    limit: '24',
                    region: 'us',
                    vary: '0',
                }
            );

            casper.click('.global-nav-menu [data-nav-type="apps"]');
        });

        casper.waitForSelector('.app-list', function() {
            helpers.selectOption('#compat-filter', 'firefoxos');
            casper.click('.mkt-wordmark');
        });

        casper.waitForSelector('[data-tracking="grouped"]', function() {
            casper.click('[data-tracking="grouped"]');
        });

        casper.waitForSelector('.app-list', function() {
            resources.forEach(function(resource) {
                var target = resource.url;
                var url = target.split('?')[0];
                var params = target.split('?')[1];

                var baseUrl = casper.evaluate(function() {
                    return require('core/settings').api_url;
                });

                if (baseUrl + '/api/v2/feed/collections/grouped' == url &&
                    utils.equals(helpers.parseQueryString(params), {
                        cache: '',
                        lang: 'en-US',
                        limit: '10',
                        region: 'us',
                        vary: '0',
                        dev: 'firefoxos'
                    })) {
                    test.fail('Feed coll resource with dev=firefoxos found');
                }
            });
        });

        helpers.done(test);
    }
});
