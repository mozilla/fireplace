/*
    Tests for generic app list pages, which are reused widely throughout
    Marketplace, including New, Popular, Recommended, Search, Category,
    Purchases, and (Feed) Collection Landing pages.
*/
var helpers = require('../lib/helpers');
var _ = require('../../node_modules/underscore');

var APP_LIMIT = 24;

var appListPages = [
    {
        endpoint: '/api/v2/fireplace/search/',
        endpointParams: {sort: 'reviewed'},
        name: 'New',
        path: '/new',
        src: 'new',
    },
    {
        endpoint: '/api/v2/fireplace/search/',
        name: 'Popular',
        path: '/popular',
        src: 'popular',
    },
    {
        endpoint: '/api/v2/apps/recommend/',
        login: true,
        name: 'Recommended',
        path: '/recommended',
        src: 'reco',
        noVary: true,
    },
    {
        endpoint: '/api/v2/fireplace/search/',
        endpointParams: {q: 'games'},
        name: 'Search',
        path: '/search?q=games',
        src: 'search'
    },
    {
        endpoint: '/api/v2/fireplace/search/',
        endpointParams: {cat: 'games'},
        name: 'Category',
        path: '/category/games',
        src: 'games-popular'
    },
    {
        endpoint: '/api/v2/installed/mine/',
        login: true,
        name: 'Purchases',
        path: '/purchases',
        src: 'myapps',
    },
    {
        collection: true,
        endpoint: '/api/v2/fireplace/feed/collections/top-games/',
        name: 'Collection',
        notLoadmore: true,
        path: '/feed/collection/top-games',
        src: 'collection-element',
    },
    {
        collection: true,
        endpoint: '/api/v2/fireplace/feed/brands/fun-games/',
        name: 'Brand',
        notLoadmore: true,
        path: '/feed/editorial/fun-games',
        src: 'branded-editorial-element',
    },
    {
        collection: true,
        endpoint: '/api/v2/fireplace/feed/shelves/telefonica-games/',
        name: 'Shelf',
        notLoadmore: true,
        path: '/feed/shelf/telefonica-games',
        src: 'operator-shelf-element',
    }
];

appListPages.forEach(function(appListPage) {
    casper.test.begin(appListPage.name + ' page app list tests', {
        test: function(test) {
            helpers.startCasper({path: appListPage.path});
            if (appListPage.login) {
                helpers.fake_login();
            }

            casper.waitForSelector('.app-list', function() {
                test.assertVisible('#search-q');

                // Test app count.
                if (appListPage.collection) {
                    test.assertExists('.app-list-app');
                }
                else {
                    test.assertExists('.app-list-app:nth-child(' + (APP_LIMIT - 1) + ')');
                    test.assertNotExists('.app-list-app:nth-child(' + (APP_LIMIT + 1) + ')');
                }

                if (!appListPage.notLoadmore) {
                    // Test loadmore button.
                    test.assertExists('.app-list .loadmore');
                }

                // Test API call.
                var endpointParams = _.extend({
                    cache: '1', vary: '0', lang: 'en-US', region: 'us',
                    limit: APP_LIMIT + ''
                }, appListPage.endpointParams || {});
                if (appListPage.noVary) {
                    delete endpointParams.vary;
                }
                helpers.assertAPICallWasMade(appListPage.endpoint, endpointParams);

                // Test app src.
                var href = this.getElementAttribute(
                    '.mkt-tile:nth-child(1)', 'href');
                test.assert(href.indexOf('src=' + appListPage.src) !== -1,
                           'Assert src');

                // Test model cache.
                casper.then(function() {
                    var modelCount = casper.evaluate(function() {
                        return Object.keys(
                            window.require('models')('app')
                                  .data_store.app).length;
                    });
                    test.assertEqual(modelCount,
                                     appListPage.collection ? 6 : APP_LIMIT,
                                     'Assert model cache');
                });

                // Test navigate to app.
                casper.click('.app-list .mkt-tile');
                test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
            }, function() {}, 10000);


            casper.run(function() {
                test.done();
            });
        }
    });
});
