 /*
     Test for the update banner states, using the mozApps mock to pretend
     Marketplace app is installed/has an update available/etc.
 */
var helpers = require('../lib/helpers');

var bannerSelector = '#marketplace-update-banner';
var downloadButtonSelector = bannerSelector + ' .download-button';


casper.test.begin('Test manifest_url', {
    test: function(test) {
        helpers.startCasper();
        helpers.waitForPageLoaded(function() {
            test.assertTruthy(casper.evaluate(function() {
                return window.require('core/settings').manifest_url;
            }), 'Check that manifest_url is defined in settings');
        });
        helpers.done(test);
    }
});


casper.test.begin('Test show banner and click download button', {
    test: function(test) {
        helpers.startCasper();
        helpers.waitForPageLoaded(function() {
            casper.evaluate(function() {
                var manifest = window.require('core/settings').manifest_url;
                window.require('core/capabilities').iframed = true;
                window.navigator.mozApps.install(manifest);
                window.navigator.mozApps._setDownloadAvailable(manifest, true);
                window.require('update_banner').showIfNeeded();
            });

            helpers.assertWaitForSelector(test, bannerSelector, function() {
                test.assertSelectorExists(downloadButtonSelector);
                casper.click(downloadButtonSelector);
            });

            casper.waitWhileSelector(downloadButtonSelector, function() {
                test.assertSelectorHasText(bannerSelector,
                    'The next time you start the Firefox Marketplace app');
                test.assertNotExists(downloadButtonSelector);
            });


        });
        helpers.done(test);
    }
});


casper.test.begin('Test banner is not shown if no download is available', {
    test: function(test) {
        helpers.startCasper();
        helpers.waitForPageLoaded(function() {
            casper.evaluate(function() {
                var manifest = window.require('core/settings').manifest_url;
                window.require('core/capabilities').iframed = true;
                window.navigator.mozApps.install(manifest);
                window.require('update_banner').showIfNeeded();
            });

            // Wait a little before checking if the banner exists, but not long
            // since our mozApps mock makes the whole thing synchronous.
            // casper.waitWhileSelector would not work because it would
            // immediately resolve since the selector doesn't initially exist.
            casper.wait(250, function() {
                test.assertNotExists('#marketplace-update-banner');
            });
        });
        helpers.done(test);
    }
});

casper.test.begin('Test banner is not shown if not in iframed/packaged app', {
    test: function(test) {
        helpers.startCasper();
        helpers.waitForPageLoaded(function() {
            casper.evaluate(function() {
                var manifest = window.require('core/settings').manifest_url;
                window.require('core/capabilities').iframed = false;
                window.require('core/capabilities').packaged = false;
                window.navigator.mozApps.install(manifest);
                window.navigator.mozApps._setDownloadAvailable(manifest, true);
                window.require('update_banner').showIfNeeded();
            });

            // Wait a little before checking if the banner exists, but not long
            // since our mozApps mock makes the whole thing synchronous.
            // casper.waitWhileSelector would not work because it would
            // immediately resolve since the selector doesn't initially exist.
            casper.wait(250, function() {
                test.assertNotExists('#marketplace-update-banner');
            });
        });
        helpers.done(test);
    }
});
