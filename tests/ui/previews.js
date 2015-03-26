/*
    Preview tray tests.
    These tests assume that app lists apps will have exactly 4 previews
    unless mocked otherwise.
*/
var jsuri = helpers.npm('jsuri/Uri');

var PREVIEW_SCROLL_TEST_DEFS = [
    // [PAGE TYPE, VIEWPORT, NUM PREVIEWS, ASSERT NUMBER OF BARS].
    // Assert number of scroll bars given the page, viewport, # of previews.
    ['detail', 'mobile', 5, 4],
    ['detail', 'mobile', 2, 0],
    ['detail', 'desktop', 5, 4],
    ['detail', 'desktop', 2, 0],
    ['appList', 'mobile', 5, 4],
    ['appList', 'mobile', 2, 0],
    ['appList', 'desktop', 5, 3],
    ['appList', 'desktop', 2, 0]
];

var PREVIEW_TRAY = '.previews-tray:not([data-previews-desktop])';
var PREVIEW_DESKTOP_DETAIL_TRAY = '.previews-tray[data-previews-desktop]';


PREVIEW_SCROLL_TEST_DEFS.forEach(function(testDef) {
    var page = testDef[0];
    var viewport = testDef[1];
    var numPreviews = testDef[2];
    var assertNumBars = testDef[3];
    var previewSlugQuery = 'num-previews-' + numPreviews;

    var path;
    if (page == 'detail') {
        path = '/app/' + previewSlugQuery;
    } else if (page == 'appList') {
        path = new jsuri('/search').addQueryParam('q', previewSlugQuery);
    }

    var tray;
    if (viewport == 'mobile' || page != 'detail') {
        tray = PREVIEW_TRAY;
    } else {
        tray = PREVIEW_DESKTOP_DETAIL_TRAY;
    }

    casper.test.begin('Test preview scroll on ' + page + '-' + viewport +
                      ' with ' + numPreviews + ' previews', {
        test: function(test) {
            helpers.startCasper(path, {viewport: viewport});

            helpers.waitForPageLoaded(function() {
                // Toggle previews if we need to.
                if (page == 'appList') {
                    casper.click('.app-list-filters-expand-toggle');
                }
            });

            casper.waitForSelector('.previews-tray[data-previews-initialized]',
                                   function() {
                // Assert number of bars.
                var barSelector = tray + ' .previews-bars b';
                if (page == 'appList') {
                    barSelector = '.app-list-app:first-child ' + barSelector;
                }
                test.assertElementCount(barSelector, assertNumBars);

                if (assertNumBars > 0) {
                    // Check arrow buttons, scroll back and forth.
                    test.assertVisible(tray + ' .arrow-btn');
                    test.assertVisible(tray + ' .arrow-btn-prev.arrow-btn-disabled');

                    for (var i = 0; i < assertNumBars - 1; i++) {
                        // Click arrow buttons until we get to the end.
                        casper.click(tray + ' .arrow-btn-next');
                    }
                    test.assertExists(tray + ' .arrow-btn-prev:not(.arrow-btn-disabled)');
                    test.assertExists(tray + ' .arrow-btn-next.arrow-btn-disabled');

                    casper.click(tray + ' .arrow-btn-prev');
                    test.assertExists(tray + ' .arrow-btn-next:not(.arrow-btn-disabled)');
                } else {
                    test.assertNotVisible(tray + ' .arrow-btn');
                }
            });

            helpers.done(test);
        }
    });
});


casper.test.begin('Test tray responsiveness on app detail', {
    test: function(test) {
        helpers.startCasper('/app/num-previews-3', {viewport: 'tablet'});

        var mobileTray = PREVIEW_TRAY + '[data-previews-detail]';
        var desktopTray = PREVIEW_DESKTOP_DETAIL_TRAY + '[data-previews-detail]';

        casper.waitForSelector(mobileTray + '[data-previews-initialized]',
                               function() {
            test.assertVisible(mobileTray);
            test.assertNotVisible(mobileTray + ' .arrow-btn');
            test.assertNotVisible(desktopTray);

            // Change viewport to see that it toggles.
            helpers.setViewport('desktop');
        });

        casper.waitForSelector(desktopTray + '[data-previews-initialized]',
                               function() {
            // Desktop tray now visible.
            test.assertVisible(desktopTray);
            test.assertVisible(desktopTray + ' .arrow-btn');
            test.assertNotVisible(mobileTray);

            helpers.setViewport('mobile');
        });

        casper.waitForSelector(mobileTray + ' .arrow-btn', function() {
            // Arrow buttons now appear because we need to scroll.
            test.assertVisible(mobileTray);
            test.assertNotVisible(desktopTray);
        });

        helpers.done(test);
    }
});


appList.appListPages.forEach(function(appListPage) {
    if (appListPage.noExpandToggle) {
        return;
    }
    [{}, {viewport: 'desktop'}].forEach(function(viewport) {
        casper.test.begin('Test ' + appListPage.name + ' ' +
                          (viewport.viewport || 'mobile') + ' preview toggle', {
            test: function(test) {
                appList.waitForAppListPage(appListPage, function() {
                    // Expand listings.
                    casper.click('.app-list-filters-expand-toggle');
                    test.assertVisible('.previews-tray li:first-child img');
                    test.assertVisible('.previews-tray .previews-bars');

                    // Collapse listings.
                    casper.click('.app-list-filters-expand-toggle');
                    test.assertExists('.app-list:not(.previews-expanded)');
                    test.assertNotVisible('.app-list-app .previews-tray');
                }, viewport);

                helpers.done(test);
            }
        });

        casper.test.begin('Test ' + appListPage.name + ' ' +
                          (viewport.viewport || 'mobile') + ' lightbox open', {
            test: function(test) {
                appList.waitForAppListPage(appListPage, function() {
                    casper.click('.previews-tray li:first-child a');
                });

                casper.waitForSelector('#lightbox.show', function() {
                    test.assertVisible('#lightbox .content li:first-child');

                    test.assertExists('#lightbox .arrow-btn-prev.arrow-btn-disabled');
                    test.assertExists('#lightbox .arrow-btn-next:not(.arrow-btn-disabled)');

                    // 3 because default 4 previews - 1.
                    for (var i = 0; i < 3; i++) {
                        casper.click('#lightbox .arrow-btn-next:not(.arrow-btn-disabled)');
                    }
                    test.assertExists('#lightbox .arrow-btn-prev:not(.arrow-btn-disabled)');
                    test.assertExists('#lightbox .arrow-btn-next.arrow-btn-disabled');
                });

                helpers.done(test);
            }
        });
    });
});


casper.test.begin('Test app detail mobile previews', {
    test: function(test) {
        helpers.startCasper({path: '/app/something'});

        helpers.waitForPageLoaded(function() {
            test.assertVisible('.previews-content');
            test.assertVisible('.previews-bars');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test app detail lightbox', {
    test: function(test) {
        helpers.startCasper('/app/num-previews-3');

        casper.waitForSelector('[data-previews-initialized]', function() {
            casper.click('.previews-tray li:first-child a');
        });

        casper.waitForSelector('#lightbox.show', function() {
            test.assertExists('#lightbox .arrow-btn-prev.arrow-btn-disabled');
            test.assertExists('#lightbox .arrow-btn-next:not(.arrow-btn-disabled)');

            // 2 because 3 previews - 1.
            for (var i = 0; i < 2; i++) {
                casper.click('#lightbox .arrow-btn-next:not(.arrow-btn-disabled)');
            }
            test.assertExists('#lightbox .arrow-btn-prev:not(.arrow-btn-disabled)');
            test.assertExists('#lightbox .arrow-btn-next.arrow-btn-disabled');

            casper.back();
        });

        casper.waitWhileVisible('#lightbox', function() {
            test.assertNotVisible('#lightbox', 'Lightbox should be invisible');

            helpers.assertUASendEvent(test, [
                'App view interactions',
                'click',
                'Screenshot view'
            ]);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test no lightbox on desktop app detail', {
    test: function(test) {
        helpers.startCasper('/app/foo', {viewport: 'desktop'});

        casper.waitForSelector('[data-previews-initialized]', function() {
            casper.click('.previews-tray li:first-child a');
        });

        casper.wait(250, function() {
            test.assertNotVisible('#lightbox.show');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test collection detail page previews no expand', {
    test: function(test) {
        // Visit the popular page and click expand.
        helpers.startCasper({path: '/popular'});
        helpers.waitForPageLoaded(function() {
            casper.click('.app-list-filters-expand-toggle');
        });

        // Visit a collection details page and check it's not expanded.
        casper.thenOpen(helpers.makeUrl('/feed/collection/top-games'));
        helpers.waitForPageLoadedAgain(function() {
            test.assertDoesntExist('.app-list.previews-expanded');
            test.assertDoesntExist('.previews-tray');
        });
        helpers.done(test);
    }
});


casper.test.begin('Test collection detail page previews no expand', {
    test: function(test) {
        // Visit the popular page and click expand.
        helpers.startCasper({path: '/popular'});
        helpers.waitForPageLoaded(function() {
            casper.click('.app-list-filters-expand-toggle');
        });

        // Visit a collection details page and check it's not expanded.
        casper.thenOpen(helpers.makeUrl('/feed/collection/top-games'));
        helpers.waitForPageLoadedAgain(function() {
            test.assertDoesntExist('.app-list.previews-expanded');
            test.assertDoesntExist('.previews-tray');
        });
        helpers.done(test);
    }
});
