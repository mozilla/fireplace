/*
    Test for app installs using the mozApps mock.
    Such as button states, UA tracking.
*/
var appList = helpers.load('app_list');


var installAttributionTestDefs = [
    // Definitions for testing that install attributions are sent as a custom
    // dimension for app installs.
    {
        name: 'Category New',
        path: '/category/games/?sort=reviewed',
        attribution: 'games-new',
    },
    {
        name: 'Category Popular',
        path: '/category/games/',
        attribution: 'games-popular',
    },
    {
        name: 'Detail',
        path: '/app/tracking/',
        attribution: 'detail',
        src: 'direct',
    },
    {
        name: 'New',
        path: '/new/',
        attribution: 'new',
    },
    {
        name: 'Popular',
        path: '/popular/',
        attribution: 'popular',
    },
    {
        name: 'Recommended',
        path: '/recommended/',
        attribution: 'reco',
    },
    {
        name: 'Search',
        path: '/search/',
        attribution: 'search',
    },
    {
        name: 'Brand landing',
        path: '/feed/editorial/brand-slug',
        attribution: 'branded-editorial-element',
        attributionSlug: 'brand-slug'
    },
    {
        name: 'Collection landing',
        path: '/feed/collection/coll-slug',
        attribution: 'collection-element',
        attributionSlug: 'coll-slug'
    },
    {
        name: 'Shelf landing',
        path: '/feed/shelf/shelf-slug',
        attribution: 'operator-shelf-element',
        attributionSlug: 'shelf-slug'
    },
];


function assertUAInstall(test, name, app, dimensions) {
    // Helper assert that attaches static dimensions relative to the app.
    dimensions = _.extend({
        dimension6: app.name,
        dimension7: app.id + '',
        dimension8: app.author,
        dimension10: app.payment_required ? 'paid' : 'free',
        dimension18: 'webapp'
    }, dimensions || {});

    helpers.assertUASendEvent(test, [
        name,
        dimensions.dimension10,
        app.UALabel,
        dimensions
    ]);
}


casper.test.begin('Test mozApps mock', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            test.assert(casper.evaluate(function() {
                var caps = window.require('core/capabilities');
                return caps.webApps && caps.packagedWebApps;
            }), 'Check webApps capability');
            test.assert(casper.evaluate(function() {
                var InstallerMock = window.require('installer_mock');
                var apps = window.require('apps');
                return InstallerMock.prototype.isPrototypeOf(apps.installer);
            }), 'Check installer_mock is used');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test install app', {
    test: function(test) {
        helpers.startCasper('/app/free');

        helpers.waitForPageLoaded(function() {
            casper.click('.install');
        });

        // Test that it changed to a launch button.
        casper.waitForSelector('.launch', function() {
            test.assertSelectorHasText('.launch', 'Open');

            // Re-navigate.
            casper.click('.privacy-policy a');
        });

        casper.waitWhileSelector('[data-page-type~="detail"]', function() {
            casper.back();
        });

        // Test that it is still a launch button.
        casper.waitForSelector('.launch', function() {
            test.assertSelectorHasText('.launch', 'Open');

            test.assert(casper.evaluate(function() {
                return window.require('core/z').apps.length == 1;
            }), 'Test install recorded in z.apps');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test markBtnsAsInstalled if many apps are already installed', {
    test: function(test) {
        helpers.startCasper('/popular');

        helpers.waitForPageLoaded(function() {
            casper.evaluate(function() {
                window.require('apps').installer._populateInstalledApps();
            });

            casper.click('.mkt-tile:first-child .install');
            casper.click('.mkt-tile:first-child');
        });

        casper.waitForSelector('[data-page-type~="detail"]', function() {
            test.assertExists('.launch');
            casper.back();
        });

        casper.waitForSelector('.app-list', function() {
            test.assertSelectorHasText('.mkt-tile:first-child .launch', 'Open');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test install packaged app', {
    test: function(test) {
        helpers.startCasper('/app/packaged');

        helpers.waitForPageLoaded(function() {
            casper.click('.install');
        });

        casper.waitForSelector('.launch', function() {
            test.assertSelectorHasText('.launch', 'Open');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test mark uninstalled apps on visibilitychange', {
    test: function(test) {
        helpers.startCasper('/app/someapp');

        helpers.waitForPageLoaded(function() {
            casper.click('.install');
        });

        casper.waitForSelector('.launch', function() {
            casper.evaluate(function() {
                window.require('apps').installer._clearInstalled();
                window.require('core/z').doc.trigger('visibilitychange');
            });

        });

        casper.waitWhileSelector('.launch', function() {
            test.assertDoesntExist('.launch');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA when installing from app details page', {
    test: function(test) {
        helpers.startCasper('/app/tracking');

        // Manually do the dimensions here for better coverage.
        var dimensions = {
            dimension6: 'Tracking',
            dimension7: '1234',
            dimension8: 'Tracking',
            dimension9: 'direct',
            dimension10: 'free',
            dimension16: 'detail',
            dimension18: 'webapp'
        };

        var app;
        helpers.waitForPageLoaded(function() {
            app = appList.getAppData('.install');
            casper.click('.install');

            helpers.assertUASendEvent(test, [
                'Click to install app',
                'free',
                app.UALabel,
                dimensions
            ]);
        });

        casper.waitForSelector('.launch', function() {
            helpers.assertUASendEvent(test, [
                'Successful app install',
                'free',
                app.UALabel,
                dimensions
            ]);
        });

        helpers.done(test);
    }
});


installAttributionTestDefs.forEach(function(testDef) {
    casper.test.begin('Test UA when installing from ' + testDef.name, {
        test: function(test) {
            helpers.startCasper(testDef.path);

            var customDimensions = {
                dimension16: testDef.attribution,
                dimension18: 'webapp'
            };
            if (testDef.src) {
                customDimensions.dimension9 = testDef.src;
            }
            if (testDef.attributionSlug) {
                customDimensions.dimension17 = testDef.attributionSlug;
            }

            var app;
            helpers.waitForPageLoaded(function() {
                app = appList.getAppData('.install');
                casper.click('.install');

                assertUAInstall(test,
                    'Click to install app',
                    app,
                    customDimensions
                );
            });

            casper.waitForSelector('.launch', function() {
                assertUAInstall(test,
                    'Click to install app',
                    app,
                    customDimensions
                );
            });

            helpers.done(test);
        }
    });
});


installAttributionTestDefs.forEach(function(testDef) {
    casper.test.begin('Test UA source when following ' + testDef.name + ' to detail page', {
        test: function(test) {
            helpers.startCasper(testDef.path);

            var customDimensions = {
                dimension9: testDef.src ? 'direct' : testDef.attribution,
                dimension16: 'detail',
                dimension18: 'webapp',
            };

            var app;
            helpers.waitForPageLoaded(function() {
                app = appList.getAppData('.mkt-tile:first-child .install');
                casper.click('.mkt-tile:first-child');
            });

            casper.waitForSelector('[data-page-type~="detail"] .install', function() {
                casper.click('.install');
                assertUAInstall(test,
                    'Click to install app',
                    app,
                    customDimensions
                );
            });

            casper.waitForSelector('.launch', function() {
                assertUAInstall(test,
                    'Click to install app',
                    app,
                    customDimensions
                );
            });

            helpers.done(test);
        }
    });
});


casper.test.begin('Test install langpack', {
    test: function(test) {
        helpers.startCasper('/langpacks/2.2');

        helpers.waitForPageLoaded(function() {

            // Initially all install buttons should be disabled because our
            // device is not compatible.
            casper.waitForSelector('.install[disabled]', function() {
                test.assertSelectorHasText('.install', 'Install');

                casper.evaluate(function() {
                    require('apps')._use_compat_cache(false);
                    require('core/capabilities').device_type = function() {
                        return 'firefoxos';
                    };
                    require('core/views').reload();
                });
            });
        });

        // Wait for reload to be over. There should not be any disabled buttons
        // any more.
        casper.waitForSelector('.install:not([disabled])', function() {
            test.assertSelectorHasText('.install', 'Install');

            // Click on first install button.
            casper.click('.mkt-tile:first-child .install');
        });

        // Test that it changed to a launch button. It should now be disabled
        // because you can't actually launch langpacks, and the text should
        // also reflect that and just say "Installed".
        casper.waitForSelector('.mkt-tile:first-child .mkt-app-button[disabled]', function() {
            test.assertSelectorHasText('.mkt-tile:first-child .mkt-app-button', 'Installed');

            // Navigate away.
            casper.click('.global-nav-menu [data-nav-type~="apps"]');
        });

        casper.waitForSelector('[data-page-type~="popular"]', function() {
            // And back.
            casper.back();
        });

        casper.waitForSelector('[data-page-type~="langpacks"]', function() {
            // Now that we are back on the langpacks page, test that the button
            // we clicked didn't change.
            casper.waitForSelector('.mkt-tile:first-child .mkt-app-button[disabled]', function() {
                test.assertSelectorHasText('.mkt-tile:first-child .mkt-app-button', 'Installed');

                test.assert(casper.evaluate(function() {
                    return window.require('core/z').apps.length == 1;
                }), 'Test install recorded in z.apps');
            });
        });

        // Done!
        helpers.done(test);
    }
});
