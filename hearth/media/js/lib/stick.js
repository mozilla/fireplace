define('stick',
    ['capabilities', 'settings', 'requests'],
    function(capabilities, settings, requests) {
    'use strict';
    /*
     * A simpler boomerang: https://github.com/yahoo/boomerang that just
     * does navigation timing. Requires jquery.
     *
     * Copied from django-statsd.
     */

    var perf = window.performance || window.msPerformance ||
               window.webkitPerformance || window.mozPerformance;

    var send = function(data) {
        if (capabilities.performance) {
            var timings = settings.timing_url;
            if (timings) {
                timings = timings.split(':', 2);
                data.client = 'stick';
                if (Math.random() < parseFloat(timings[1])) {
                    requests.post(timings[0], data);
                }
            }
        }
    };

    var stick = {};

    stick.basic = function() {
        /* Sends the timing data to the given URL */
        if (capabilities.performance) {
            setTimeout(function() {
                send({
                    'window.performance.timing.navigationStart': perf.timing.navigationStart,
                    'window.performance.timing.domComplete': perf.timing.domComplete,
                    'window.performance.timing.domInteractive': perf.timing.domInteractive,
                    'window.performance.timing.domLoading': perf.timing.domLoading,
                    'window.performance.timing.loadEventEnd': perf.timing.loadEventEnd,
                    'window.performance.timing.responseStart': perf.timing.responseStart,
                    'window.performance.navigation.redirectCount': perf.navigation.redirectCount,
                    'window.performance.navigation.type': perf.navigation.type,
                })
            }, 1000);
        }
    };

    stick.custom = function(data) {
        data['window.performance.timing.navigationStart'] = 0;
        send(data);
    };

    function init() {
        // Navigation timing.
        stick.basic();
    }

    return {init: init};
});
