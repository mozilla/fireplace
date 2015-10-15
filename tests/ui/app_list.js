/*
    Tests for app list pages, which are reused widely throughout
    Marketplace, including New, Popular, Recommended, Search, Category,
    Purchases, (Feed) Collection Landing pages, and Langpacks.

    If you are testing something that can be found throughout all or most
    app list pages, here is a good place to put it for ultimate coverage.
*/
var appList = helpers.load('app_list');
var constants = helpers.load('constants');

var appNthChild = appList.appNthChild;
var waitForAppListPage = appList.waitForAppListPage;
var waitForLoadMore = appList.waitForLoadMore;
var APP_LIMIT = constants.APP_LIMIT;
var APP_LIMIT_LOADMORE = constants.APP_LIMIT_LOADMORE;


appList.appListPages.forEach(function(appListPage) {
    if (!appListPage.appLimit) {
        appListPage.appLimit = APP_LIMIT;
    }

    casper.test.begin(appListPage.name + ' page app list main tests', {
        test: function(test) {
            waitForAppListPage(appListPage, function() {
                // Test app count.
                test.assertExists(appNthChild(appListPage.appLimit - 1));
                test.assertNotExists(appNthChild(appListPage.appLimit + 1));

                // Test API call.
                var endpointParams = appList.getEndpointParams(appListPage);
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
                    test.assert(!href, 'Assert href is empty');
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
                    test.assertExists('.app-list.previews-expanded');
                    helpers.assertUASendEvent(test, [
                        'View type interactions',
                        'click',
                        'Expanded view'
                    ]);

                    // List view.
                    casper.click(toggleLink);
                    test.assertExists(toggleLink + ':not(.active)');
                    test.assertExists('.app-list:not(.previews-expanded)');
                    helpers.assertUASendEvent(test, [
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
                        var endpointParams = appList.getEndpointParams(appListPage);
                        endpointParams.offset = appListPage.appLimit + '';
                        helpers.assertAPICallWasMade(appListPage.endpoint,
                                                     endpointParams);

                        // Test model cache after load more.
                        if (!appListPage.noModelCache) {
                            var modelKeys = casper.evaluate(function() {
                                return Object.keys(
                                    window.require('core/models')('app')
                                        .data_store.app);
                            });
                            casper.echo(modelKeys);
                            test.assertEqual(
                                modelKeys.length,
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
                    casper.thenClick('.mkt-wordmark');

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

    if (!appListPage.noAppInstall) {
        casper.test.begin(appListPage.name + ' app install tests', {
            test: function(test) {
                var installButton = '.app-list-app:first-child .install';
                waitForAppListPage(appListPage);
                casper.waitForSelector(installButton, function() {
                    casper.click(installButton);

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
