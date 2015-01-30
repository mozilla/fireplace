/*
    Test for app installs using the mozApps mock.
    Such as button states, UA tracking.
*/
var appList = require('../lib/app_list');
var helpers = require('../lib/helpers');
var mozApps = require('../lib/mozApps');


casper.test.begin('Test mozApps mock', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            test.assert(casper.evaluate(function() {
                return window.require('core/capabilities').webApps;
            }), 'Check mozApps mock is working');
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
                return window.require('z').apps.length == 1;
            }), 'Test install recorded in z.apps');
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


casper.test.begin('Test UA when installing from app details page', {
    test: function(test) {
        helpers.startCasper('/app/free');

        var app;
        helpers.waitForPageLoaded(function() {
            app = appList.getAppData('.install');
            casper.click('.install');

            helpers.assertUATracking(test, [
                'Click to install app',
                'free',
                app.UALabel,
                0
            ]);
        });

        casper.waitForSelector('.launch', function() {
            helpers.assertUATracking(test, [
                'Successful app install',
                'free',
                app.UALabel,
                0
            ]);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA when installing from listing page', {
    test: function(test) {
        helpers.startCasper('/search');

        var app;
        helpers.waitForPageLoaded(function() {
            var sel = '.app-list-app:nth-child(2) .install';
            app = appList.getAppData(sel);
            casper.click(sel);

            helpers.assertUATracking(test, [
                'Click to install app',
                'free',
                app.UALabel,
                1
            ]);
        });

        casper.waitForSelector('.launch', function() {
            helpers.assertUATracking(test, [
                'Successful app install',
                'free',
                app.UALabel,
                1
            ]);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA when installing from listing page', {
    test: function(test) {
        helpers.startCasper('/search');

        var app;
        helpers.waitForPageLoaded(function() {
            var sel = '.app-list-app:nth-child(5) .install';
            app = appList.getAppData(sel);
            casper.click(sel);

            helpers.assertUATracking(test, [
                'Click to install app',
                'free',
                app.UALabel,
                4  // nth-child(5).
            ]);
        });

        casper.waitForSelector('.launch', function() {
            helpers.assertUATracking(test, [
                'Successful app install',
                'free',
                app.UALabel,
                4  // nth-child(5).
            ]);
        });

        helpers.done(test);
    }
});
