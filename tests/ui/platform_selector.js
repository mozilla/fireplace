var appList = helpers.load('app_list');
var constants = helpers.load('constants');
var jsuri = helpers.npm('jsuri/Uri');


var NUM_DESKTOP_OPTIONS = 5;


function phantomSkip(test) {
    if (helpers.browser.isPhantom) {
        console.log('Skipping mkt-select tests since Phantom\'s ' +
                    'HTMLSelectElement prototype is incomplete');
        test.skip(1);
        helpers.done(test);
        return true;
    }
}


function platformSelectorSetUp(cb) {
    helpers.waitForPageLoaded(function() {
        casper.waitForSelector('mkt-select', cb);
    });
}


function selectOption(value) {
    casper.click('.compat-filter mkt-option[value="' + value + '"]');
}


function assertSelectedDevice(test, device) {
    // Ask the module if our device filter is active.
    test.assert(casper.evaluate(function(device) {
        return window.require('compat_filter').isDeviceSelected(device);
    }, device), 'Check filtering device is ' + (device || 'all'));
}


casper.test.begin('Test platform selector dropdown options', {
    test: function(test) {
        helpers.startCasper(new jsuri('/search').addQueryParam('q', 'foo'));

        platformSelectorSetUp(function() {
            test.assertExists('.compat-filter [value="all"]');
            test.assertExists('.compat-filter [value="desktop"]');
            test.assertExists('.compat-filter [value="firefoxos"]');
            test.assertExists('.compat-filter [value="android-mobile"]');
            test.assertExists('.compat-filter [value="android-tablet"]');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test platform selector dropdown toggle', {
    test: function(test) {
        helpers.startCasper(new jsuri('/search').addQueryParam('q', 'foo'));

        platformSelectorSetUp(function() {
            test.assertDoesntExist('.compat-filter.mkt-select--visible');
            casper.click('.compat-filter mkt-selected');
            test.assertExists('.compat-filter.mkt-select--visible');
            casper.click('.compat-filter mkt-option');
            test.assertDoesntExist('.compat-filter.mkt-select--visible');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test platform selector selected text', {
    test: function(test) {
        helpers.startCasper('/popular');

        if (phantomSkip(test)) {
            return;
        }

        platformSelectorSetUp(function() {
            test.assertSelectorHasText('mkt-selected-text', 'Desktop');
            selectOption('all');
            test.assertSelectorHasText('mkt-selected-text', 'All Platforms');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test platform selector option indices', {
    test: function(test) {
        helpers.startCasper('/popular');

        if (phantomSkip(test)) {
            return;
        }

        function assertIndices() {
            for (var i = 0; i < NUM_DESKTOP_OPTIONS - 1; i++) {
                test.assertExists('.compat-filter mkt-option' +
                                  '[data-mkt-option--index="' + i + '"]');
            }
        }

        platformSelectorSetUp(function() {
            assertIndices();

            selectOption('desktop');
            test.assertDoesntExist(
                '.compat-filter ' +
                'mkt-option[value="desktop"][data-mkt-option--index]');
            assertIndices();

            selectOption('firefoxos');
            test.assertExists(
                'mkt-option[value="desktop"][data-mkt-option--index]');
            assertIndices();
        });

        helpers.done(test);
    }
});


casper.test.begin('Test platform selector dropdown change', {
    test: function(test) {
        helpers.startCasper(new jsuri('/search').addQueryParam('q', 'foo'));

        if (phantomSkip(test)) {
            return;
        }

        platformSelectorSetUp(function() {
            assertSelectedDevice(test, 'desktop');
            selectOption('firefoxos');
            assertSelectedDevice(test, 'firefoxos');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test platform selector dropdown persist for site', {
    test: function(test) {
        helpers.startCasper(new jsuri('/search').addQueryParam('q', 'foo'));

        if (phantomSkip(test)) {
            return;
        }

        platformSelectorSetUp(function() {
            selectOption('firefoxos');
            casper.click('.mkt-wordmark');
        });

        casper.waitForSelector('[data-page-type~="homepage"]', function() {
            casper.click('[data-mkt-nav--item="popular"] a');
        });

        casper.waitForSelector('.app-list', function() {
            // Still FirefoxOS.
            assertSelectedDevice(test, 'firefoxos');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test platform selector dropdown persists between sessions', {
    test: function(test) {
        helpers.startCasper(new jsuri('/search').addQueryParam('q', 'foo'));

        if (phantomSkip(test)) {
            return;
        }

        platformSelectorSetUp(function() {
            selectOption('firefoxos');
            casper.thenOpen(helpers.makeUrl('/popular'));
        });

        casper.waitForSelector('[data-page-type~="popular"]', function() {
            assertSelectedDevice(test, 'firefoxos');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test platform selectoring persists after search', {
    test: function(test) {
        helpers.startCasper({path: '/search?q=test'});

        if (phantomSkip(test)) {
            return;
        }

        platformSelectorSetUp(function() {
            selectOption('desktop');
            assertSelectedDevice(test, 'desktop');

            casper.fill('.header--search-form', {q: 'test'}, true);

            casper.waitForSelector('.app-list', function() {
                casper.waitForUrl(/\/search\?q=test$/, function() {
                    assertSelectedDevice(test, 'desktop');
                });
            });
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA platform selector change', {
    test: function(test) {
        helpers.startCasper('/popular');

        if (phantomSkip(test)) {
            return;
        }

        platformSelectorSetUp(function() {
            helpers.assertUASetSessionVar(test, ['dimension2', 'desktop']);

            selectOption('firefoxos');
            test.assert(helpers.filterUALogs([
                'send',
                'event',
                'Change platform filter',
                'click',
                'firefoxos'
            ]).length > 0, 'Test change platform filter event');

            helpers.assertUASetSessionVar(test, ['dimension2', 'firefoxos']);
        });

        helpers.done(test);
    }
});


appList.appListPages.forEach(function(appListPage) {
    if (!appListPage.appLimit) {
        appListPage.appLimit = constants.APP_LIMIT;
    }

    if (!appListPage.noCompatFiltering) {
        casper.test.begin('Test ' + appListPage.name + ' platform selector', {
            test: function(test) {
                helpers.startCasper({
                    path: new jsuri(appListPage.path)
                });

                if (phantomSkip(test)) {
                    return;
                }

                if (appListPage.login) {
                    helpers.waitForPageLoaded(function() {
                        helpers.fake_login();
                        platformSelectorSetUp(testCompatFiltering);
                    });
                } else {
                    platformSelectorSetUp(testCompatFiltering);
                }

                function testCompatFiltering() {
                    // Test field is correct if device filtering present.
                    test.assertVisible('mkt-select');
                    selectOption('desktop');
                    assertSelectedDevice(test, 'desktop');

                    // Test API call.
                    var endpointParams = appList.getEndpointParams(appListPage, {
                        dev: 'desktop'
                    });

                    casper.waitForSelector('.app-list', function() {
                        helpers.assertAPICallWasMade(appListPage.endpoint,
                                                     endpointParams);

                        // Test basic count during device filtering.
                        test.assertExists(
                            appList.appNthChild(appListPage.appLimit - 1));
                        test.assertNotExists(
                            appList.appNthChild(appListPage.appLimit + 1));

                        if (!appListPage.noLoadMore) {
                            appList.waitForLoadMore(function() {
                                assertSelectedDevice(test, 'desktop');
                            });
                        }
                    });
                }

                helpers.done(test);
            }
        });
    }
});
