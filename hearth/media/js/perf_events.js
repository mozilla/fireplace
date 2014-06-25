/* developer.mozilla.org/Apps/Build/Performance/Firefox_OS_app_responsiveness_guidelines */
define('perf_events', ['z'], function(z) {
    'use strict';

    var splash_removed = false;
    var mozapps_got_installed = false;
    var app_loaded = false;

    // PerformanceTestHelper events.
    /*
    z.page.one('reloaded_chrome', function() {
        // Emit this event when your application designates that its core
        // chrome or navigation interface exists in the DOM.
        console.log('-moz-chrome-dom-loaded');
        window.dispatchEvent(new CustomEvent('moz-chrome-dom-loaded'));
    })
    .one('build_start', function() {
        // Emit this event when your application designates that the core
        // chrome or navigation interface has its events bound and is ready for
        // user interation.
        console.log('-moz-chrome-interactive');
        window.dispatchEvent(new CustomEvent('moz-chrome-interactive'));
    })
    .one('loaded', function() {
        // Emit this event when your application designates that it is visually
        // loaded.
        console.log('-moz-visually-complete');
        window.dispatchEvent(new CustomEvent('moz-app-visually-complete'));
    })
    */

    z.page.one('splash_removed', function() {
        console.log('-moz-content-interactive');
        splash_removed = true;

        // Only once splash is removed can stuff be done.
        window.dispatchEvent(new CustomEvent('moz-chrome-dom-loaded'));
        window.dispatchEvent(new CustomEvent('moz-chrome-interactive'));
        window.dispatchEvent(new CustomEvent('moz-app-visually-complete'));

        // Emit this event when your application designates that it has bound
        // the events for the minimum set of functionality to allow the user to
        // interact with the "above-the-fold" content.
        window.dispatchEvent(new CustomEvent('moz-content-interactive'));

        if (mozapps_got_installed && !app_loaded) {
            // Emit this event when your application has been completely
            // loaded.
            console.log('-moz-app-loaded');
            app_loaded = true;
            window.dispatchEvent(new CustomEvent('moz-app-loaded'));
        }
    })
    .one('mozapps_got_installed', function() {
        mozapps_got_installed = true;

        if (splash_removed && !app_loaded) {
            // Emit this event when your application has been completely
            // loaded.
            console.log('-moz-app-loaded');
            app_loaded = true;
            window.dispatchEvent(new CustomEvent('moz-app-loaded'));
        }
    });
});
