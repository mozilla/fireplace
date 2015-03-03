/*
    Tests for app list pages, which are reused widely throughout
    Marketplace, including New, Popular, Recommended, Search, Category,
    Purchases, (Feed) Collection Landing pages, and Langpacks.

    If you are testing something that can be found throughout all or most
    app list pages, here is a good place to put it for ultimate coverage.
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
        noCompatFiltering: true,
        noVary: true,
        path: '/purchases',
        src: 'myapps',
    },
    {
        appLimit: 6,
        endpoint: '/api/v2/fireplace/feed/collections/top-games/',
        name: 'Collection',
        noCompatFiltering: true,
        noExpandToggle: true,
        noLoadMore: true,
        path: '/feed/collection/top-games',
        src: 'collection-element',
    },
    {
        appLimit: 6,
        endpoint: '/api/v2/fireplace/feed/brands/fun-games/',
        name: 'Brand',
        noCompatFiltering: true,
        noExpandToggle: true,
        noLoadMore: true,
        path: '/feed/editorial/fun-games',
        src: 'branded-editorial-element',
    },
    {
        appLimit: 6,
        endpoint: '/api/v2/fireplace/feed/shelves/telefonica-games/',
        name: 'Shelf',
        noCompatFiltering: true,
        noExpandToggle: true,
        noLoadMore: true,
        path: '/feed/shelf/telefonica-games',
        src: 'operator-shelf-element',
    },
    {
        endpoint: '/api/v2/langpacks/',
        endpointParams: {fxos_version: '2.2'},
        name: 'Langpacks',
        noAppInstall: true,
        noCompatFiltering: true,
        noDetailPage: true,
        noExpandToggle: true,
        noLoadMore: false,
        noModelCache: true,
        path: '/langpacks/2.2',
    }
];

appListPages.forEach(function(appListPage) {
    if (!appListPage.appLimit) {
        appListPage.appLimit = APP_LIMIT;
    }

    casper.test.begin(appListPage.name + ' page app list main tests', {
        test: function(test) {
            waitForAppListPage(appListPage, function() {
                test.assertVisible('.search');

                // Test app count.
                test.assertExists(appNthChild(appListPage.appLimit - 1));
                test.assertNotExists(appNthChild(appListPage.appLimit + 1));

                // Test API call.
                var endpointParams = getEndpointParams(appListPage);
                helpers.assertAPICallWasMade(appListPage.endpoint, endpointParams);

                // Test app src.
                var href = this.getElementAttribute('.mkt-tile:nth-child(1)',
                                                    'href');
                if (appListPage.src) {
                    test.assert(href.indexOf('src=' + appListPage.src) !== -1,
                                'Assert src');
                } else {
                    // If no src is configured, it means this app list does not
                    // contain any links.
                    test.assertEqual(href, '', 'Assert href is empty');
                }

                // Test authors are not a link.
                test.assertDoesntExist('.mkt-tile .author a');

                // Test navigate to app.
                if (!appListPage.noDetailPage) {
                    casper.click('.app-list .mkt-tile');
                    test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
                }
            });

            helpers.done(test);
        }
    });

    if (!appListPage.noModelCache) {
        casper.test.begin(appListPage.name + ' page app list model cache test', {
            test: function(test) {
                waitForAppListPage(appListPage, function() {
                    // Test model cache.
                    var modelCount = casper.evaluate(function() {
                        return Object.keys(
                            window.require('core/models')('app')
                                  .data_store.app).length;
                    });
                    test.assertEqual(modelCount,
                                     appListPage.appLimit,
                                     'Assert model cache');
                });

                helpers.done(test);
            }
        });
    }

    if (!appListPage.noExpandToggle) {
        casper.test.begin(appListPage.name + ' page app list expand toggle', {
            test: function(test) {
                var toggleLink = '.app-list-filters-expand-toggle';

                waitForAppListPage(appListPage);

                // Wait for the button to be intialized.
                casper.waitForSelector(toggleLink + '.show', function() {
                    // Test expand toggle.
                    test.assertExists(toggleLink + ':not(.active)');
                });

                // Expanded view.
                casper.thenClick(toggleLink);

                casper.waitForSelector(toggleLink + '.active', function() {
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
                });

                helpers.done(test);
            }
        });
    }

    if (!appListPage.noLoadMore) {
        casper.test.begin(appListPage.name + ' page app list load more', {
            test: function(test) {
                waitForAppListPage(appListPage, function() {
                    // Test `Load more` button.
                    waitForLoadMore(function() {
                        // Test API call.
                        var endpointParams = getEndpointParams(appListPage);
                        getEndpointParams.offset = appListPage.appLimit + '';
                        helpers.assertAPICallWasMade(appListPage.endpoint,
                                                     endpointParams);

                        // Test model cache after load more.
                        if (!appListPage.noModelCache) {
                            var modelCount = casper.evaluate(function() {
                                return Object.keys(
                                    window.require('core/models')('app')
                                        .data_store.app).length;
                            });
                            test.assertEqual(
                                modelCount,
                                APP_LIMIT_LOADMORE,
                                'Assert model cache after Load more');
                        }

                        // Test navigate to app.
                        if (!appListPage.noDetailPage) {
                            casper.click('.app-list .mkt-tile');
                            test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
                        }
                    });
                });

                helpers.done(test);
            }
        });

        casper.test.begin(appListPage.name + ' page pagination rewrite tests', {
            // Test that clicking `Load more` rewrites the new apps into the cache.
            // Apps still there after nav to a different page and then going back.
            test: function(test) {
                waitForAppListPage(appListPage, function() {
                    test.assertExists(appNthChild(appListPage.appLimit - 1));
                    test.assertNotExists(appNthChild(appListPage.appLimit + 1));

                    waitForLoadMore();
                    casper.thenClick('.wordmark');

                    // Wait for the homepage to load before moving back.
                    helpers.waitForFeedItem(function() {
                        casper.back();
                    });
                    casper.waitUntilVisible(appNthChild(APP_LIMIT_LOADMORE));
                });

                helpers.done(test);
            }
        });
    }

    if (!appListPage.noCompatFiltering) {
        casper.test.begin(appListPage.name + ' page compatibility filtering tests', {
            test: function(test) {
                waitForAppListPage(appListPage, function() {
                    test.assertField('compatibility_filtering', 'all');
                });

                if (!appListPage.noLoadMore) {
                    waitForLoadMore(function() {
                        // Test compatibility filtering after load more.
                        test.assertField('compatibility_filtering', 'all');
                    });
                }

                helpers.done(test);
            }
        });

        casper.test.begin(appListPage.name + ' compatibility filtering tests', {
            test: function(test) {
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
                    test.assertExists(appNthChild(appListPage.appLimit - 1));
                    test.assertNotExists(appNthChild(appListPage.appLimit + 1));

                    if (!appListPage.noLoadMore) {
                        appList.waitForLoadMore(function() {
                            test.assertField('compatibility_filtering', 'desktop');
                        });
                    }
                }

                helpers.done(test);
            }
        });
    }

    if (!appListPage.noExpandToggle) {
        casper.test.begin(appListPage.name + ' mobile previews tests', {
            test: function(test) {
                waitForAppListPage(appListPage, function() {
                    // Expand listings.
                    casper.click('.app-list-filters-expand-toggle');
                    test.assertVisible('.previews-tray li:first-child img');
                    test.assertVisible('.previews-tray .previews-bars');
                    test.assertNotVisible('.previews-tray .arrow-button');

                    // Collapse listings.
                    casper.click('.app-list-filters-expand-toggle');
                    test.assertExists('.app-list:not(.expanded)');
                    test.assertNotVisible('.app-list-app .previews-tray');
                });

                helpers.done(test);
            }
        });

        casper.test.begin(appListPage.name + ' desktop previews tests', {
            test: function(test) {
                waitForAppListPage(appListPage, function() {
                    // Expand listings.
                    casper.click('.app-list-filters-expand-toggle');
                    test.assertVisible('.previews-tray li:first-child img');
                    test.assertVisible('.previews-tray .previews-bars');
                    test.assertVisible('.previews-tray .arrow-button');

                    // Collapse listings.
                    casper.click('.app-list-filters-expand-toggle');
                    test.assertExists('.app-list:not(.expanded)');
                    test.assertNotVisible('.app-list-app .previews-tray');
                }, {viewport: 'desktop'});

                helpers.done(test);
            },
        });
    }

    if (!appListPage.noAppInstall) {
        casper.test.begin(appListPage.name + ' app install tests', {
            test: function(test) {
                waitForAppListPage(appListPage, function() {
                    casper.click('.app-list-app:first-child .install');

                    casper.waitForSelector('.launch', function() {
                        test.assertSelectorHasText(
                            '.app-list-app:first-child .install',
                            'Open');
                    });
                });

                helpers.done(test);
            },
        });
    }
});


casper.test.begin('Test collection detail page for app tile expanded state.', {
    test: function(test) {
        // Visit the popular page and click expand.
        helpers.startCasper({path: '/popular'});
        helpers.waitForPageLoaded(function() {
            casper.click('.app-list-filters-expand-toggle');
        });

        // Visit a collection details page and check it's not expanded.
        casper.thenOpen(helpers.makeUrl('/feed/collection/top-games'), function() {
            helpers.waitForPageLoadedAgain(function() {
                test.assertDoesntExist('.app-list.expanded');
                test.assertDoesntExist('.previews-tray');
            });
        });
        helpers.done(test);
    }
});
