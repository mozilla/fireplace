/*
    Tests for generic app list pages, which are reused widely throughout
    Marketplace, including New, Popular, Recommended, Search, Category,
    Purchases, and (Feed) Collection Landing pages.
*/
var appList = require('../lib/app_list');
var constants = require('../lib/constants');
var helpers = require('../lib/helpers');

var _ = require('../../node_modules/underscore');
var jsuri = require('../../node_modules/jsuri');

var appNthChild = appList.appNthChild;
var waitForAppListPage = appList.waitForAppListPage;
var waitForLoadMore = appList.waitForLoadMore;
var APP_LIMIT = constants.APP_LIMIT;
var APP_LIMIT_LOADMORE = constants.APP_LIMIT_LOADMORE;

function getEndpointParams(appListPage, extend) {
    var endpointParams = _.extend({
        cache: '1', vary: '0', lang: 'en-US', region: 'us',
        limit: APP_LIMIT + ''
    }, appListPage.endpointParams || {});

    if (appListPage.noCache) {
        delete endpointParams.cache;
    }
    if (appListPage.noVary) {
        delete endpointParams.vary;
    }

    return _.extend(endpointParams, extend || {});
}

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
        endpoint: '/api/v2/account/installed/mine/',
        endpointParams: {_user: 'mocktoken'},
        login: true,
        name: 'Purchases',
        noCache: true,
        noVary: true,
        path: '/purchases',
        src: 'myapps',
    },
    {
        collection: true,
        endpoint: '/api/v2/fireplace/feed/collections/top-games/',
        name: 'Collection',
        notLoadMore: true,
        path: '/feed/collection/top-games',
        src: 'collection-element',
    },
    {
        collection: true,
        endpoint: '/api/v2/fireplace/feed/brands/fun-games/',
        name: 'Brand',
        notLoadMore: true,
        path: '/feed/editorial/fun-games',
        src: 'branded-editorial-element',
    },
    {
        collection: true,
        endpoint: '/api/v2/fireplace/feed/shelves/telefonica-games/',
        name: 'Shelf',
        notLoadMore: true,
        path: '/feed/shelf/telefonica-games',
        src: 'operator-shelf-element',
    }
];

appListPages.forEach(function(appListPage) {
    casper.test.begin(appListPage.name + ' page app list tests', {
        test: function(test) {
            waitForAppListPage(appListPage, function() {
                test.assertVisible('.search');

                // Test app count.
                if (appListPage.collection) {
                    test.assertExists('.app-list-app');
                }
                else {
                    test.assertExists(appNthChild(APP_LIMIT - 1));
                    test.assertNotExists(appNthChild(APP_LIMIT + 1));
                }

                // Test API call.
                var endpointParams = getEndpointParams(appListPage);
                helpers.assertAPICallWasMade(appListPage.endpoint, endpointParams);

                // Test app src.
                var href = this.getElementAttribute('.mkt-tile:nth-child(1)',
                                                    'href');
                test.assert(href.indexOf('src=' + appListPage.src) !== -1,
                           'Assert src');

                // Test model cache.
                var modelCount = casper.evaluate(function() {
                    return Object.keys(
                        window.require('models')('app')
                              .data_store.app).length;
                });
                test.assertEqual(modelCount,
                                 appListPage.collection ? 6 : APP_LIMIT,
                                 'Assert model cache');

                // Test expand toggle.
                if (!appListPage.collection) {
                    var toggleLink = '.app-list-filters-expand-toggle';
                    test.assertVisible(toggleLink);

                    // Expanded view.
                    casper.click(toggleLink);
                    test.assertExists(toggleLink + '.active');
                    test.assertExists('.app-list.expanded');
                    helpers.assertUATracking(test, [
                        'View type interactions',
                        'click',
                        'Expanded view'
                    ]);

                    // List view.
                    casper.click(toggleLink);
                    test.assertExists(toggleLink + ':not(.active)');
                    test.assertExists('.app-list:not(.expanded)');
                    helpers.assertUATracking(test, [
                        'View type interactions',
                        'click',
                        'List view'
                    ]);
                }

                // Test authors are not a link.
                test.assertDoesntExist('.mkt-tile .author a');

                if (!appListPage.notLoadMore) {
                    // Test `Load more` button.
                    waitForLoadMore(function() {
                        getEndpointParams.offset = APP_LIMIT + '';
                        helpers.assertAPICallWasMade(appListPage.endpoint, endpointParams);

                        // Test model cache after load more.
                        var modelCount = casper.evaluate(function() {
                            return Object.keys(
                                window.require('models')('app')
                                      .data_store.app).length;
                        });
                        test.assertEqual(modelCount, APP_LIMIT_LOADMORE,
                                         'Assert model cache after Load more');

                        // Test navigate to app.
                        casper.click('.app-list .mkt-tile');
                        test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
                    });
                } else {
                    // Test navigate to app.
                    casper.click('.app-list .mkt-tile');
                    test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
                }
            });

            helpers.done(test);
        }
    });

    if (appListPage.collection) {
        return;
    }

    casper.test.begin(appListPage.name + ' page compatibility filtering tests', {
        test: function(test) {
            waitForAppListPage(appListPage, function() {
                test.assertField('compatibility_filtering', 'all');
            });

            waitForLoadMore(function() {
                // Test compatibility filtering after load more.
                test.assertField('compatibility_filtering', 'all');
            });

            helpers.done(test);
        }
    });

    casper.test.begin(appListPage.name + ' page pagination rewrite tests', {
        // Test that clicking `Load more` rewrites the new apps into the cache.
        // Apps still there after nav to a different page and then going back.
        test: function(test) {
            waitForAppListPage(appListPage, function() {
                test.assertExists(appNthChild(APP_LIMIT - 1));
                test.assertNotExists(appNthChild(APP_LIMIT + 1));

                waitForLoadMore(function() {
                    casper.click('.wordmark');
                    casper.back();
                    casper.waitUntilVisible(appNthChild(APP_LIMIT_LOADMORE));
                });
            });

            helpers.done(test);
        }
    });

    casper.test.begin(appListPage.name + ' compatibility filtering tests', {
        test: function(test) {
            if (appListPage.name == 'Purchases') {
                helpers.done(test);
                return;
            }

            helpers.startCasper({
                path: new jsuri(appListPage.path).addQueryParam(
                    'device_override', 'desktop')
            });

            if (appListPage.login) {
                helpers.waitForPageLoaded(function() {
                    helpers.fake_login();
                    helpers.waitForPageLoaded(testCompatFiltering);
                });
            } else {
                helpers.waitForPageLoaded(testCompatFiltering);
            }

            function testCompatFiltering() {
                // Test field is correct if device filtering present in params.
                test.assertVisible('.compat-select-wrapper');
                test.assertField('compatibility_filtering', 'desktop');

                // Test API call.
                var endpointParams = getEndpointParams(appListPage, {
                    dev: 'desktop'
                });
                if (['Category', 'Search'].indexOf(appListPage.name) !== -1) {
                    // utils.urlparams attaches any params from w.location.
                    endpointParams.device_override = 'desktop';
                }
                helpers.assertAPICallWasMade(appListPage.endpoint,
                                             endpointParams);

                // Test basic count during device filtering.
                test.assertExists(appNthChild(constants.APP_LIMIT - 1));
                test.assertNotExists(appNthChild(constants.APP_LIMIT + 1));

                appList.waitForLoadMore(function() {
                    test.assertField('compatibility_filtering', 'desktop');
                });
            }

            helpers.done(test);
        }
    });

    casper.test.begin(appListPage.name + ' mobile previews tests', {
        test: function(test) {
            waitForAppListPage(appListPage, function() {
                // Expand listings.
                casper.click('.app-list-filters-expand-toggle');
                test.assertVisible('.previews li:first-child img');
                test.assertNotVisible('.tray .bars');
                test.assertNotVisible('.tray .arrow-button');

                // Collapse listings.
                casper.click('.app-list-filters-expand-toggle');
                test.assertExists('.app-list:not(.expanded)');
                test.assertNotVisible('.app-list-app .preview');
            });

            helpers.done(test);
        }
    });

    casper.test.begin(appListPage.anem + ' desktop previews tests',
    helpers.desktopTest({
        test: function(test) {
            waitForAppListPage(appListPage, function() {
                // Expand listings.
                casper.click('.app-list-filters-expand-toggle');
                test.assertVisible('.previews li:first-child img');
                test.assertVisible('.tray .bars');
                test.assertVisible('.tray .arrow-button');

                // Collapse listings.
                casper.click('.app-list-filters-expand-toggle');
                test.assertExists('.app-list:not(.expanded)');
                test.assertNotVisible('.app-list-app .preview');
            });

            helpers.done(test);
        }
    }));
});

casper.test.begin('Test collection detail page for app tile expanded state.', {
    test: function(test) {
        // Visit the popular page and click expand.
        helpers.startCasper({path: '/popular'});
        helpers.waitForPageLoaded(function() {
            casper.click('.app-list-filters-expand-toggle');
        });

        // Visit a collection details page and check it's not expanded.
        helpers.startCasper({path: '/feed/collection/top-games'});
        helpers.waitForPageLoaded(function() {
            test.assertDoesntExist('.app-list.expanded');
            test.assertDoesntExist('.previews');
        });
        helpers.done(test);
    }
});
