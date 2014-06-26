/* developer.mozilla.org/Apps/Build/Performance/Firefox_OS_app_responsiveness_guidelines */
define('perf_events', ['z'], function(z) {
    'use strict';

    // PerformanceTestHelper events.
    z.page.one('reloaded_chrome', function() {
        // Emit this event when your application designates that its core
        // chrome or navigation interface exists in the DOM.
        window.dispatchEvent(new CustomEvent('moz-chrome-interactive'));
    })
    .one('loaded', function() {
        // Emit this event when your application designates that it has bound
        // the events for the minimum set of functionality to allow the user to
        // interact with the "above-the-fold" content.
        window.dispatchEvent(new CustomEvent('moz-content-interactive'));
    })
    .one('splash_removed', function() {
        // Only once splash is removed can stuff be done.
        window.dispatchEvent(new CustomEvent('moz-chrome-dom-loaded'));
        window.dispatchEvent(new CustomEvent('moz-app-visually-complete'));
    })
    .one('images_loaded', function() {
        // Emit this event when your application has been completely
        // loaded.
        window.dispatchEvent(new CustomEvent('moz-app-loaded'));
    });
});
