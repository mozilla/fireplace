define('capabilities', [], function() {
    function safeMatchMedia(query) {
        var m = window.matchMedia(query);
        return !!m && m.matches;
    }

    var capabilities = {
        'JSON': window.JSON && typeof JSON.parse == 'function',
        'debug': document.location.href.indexOf('dbg') >= 0,
        'debug_in_page': document.location.href.indexOf('dbginpage') >= 0,
        'console': window.console && typeof window.console.log == 'function',
        'replaceState': typeof history.replaceState === 'function',
        'chromeless': window.locationbar && !window.locationbar.visible,
        'webApps': !!(navigator.mozApps && navigator.mozApps.install),
        'app_runtime': !!(
            navigator.mozApps &&
            typeof navigator.mozApps.html5Implementation === 'undefined'
        ),
        'fileAPI': !!window.FileReader,
        'userAgent': navigator.userAgent,
        'widescreen': safeMatchMedia('(min-width: 1024px)'),
        'firefoxAndroid': navigator.userAgent.indexOf('Firefox') != -1 && navigator.userAgent.indexOf('Android') != -1,
        'touch': ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
        'nativeScroll': (function() {
            return 'WebkitOverflowScrolling' in document.createElement('div').style;
        })(),
        'performance': !!(window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance),
        'navPay': !!navigator.mozPay,
        'webactivities': !!(window.setMessageHandler || window.mozSetMessageHandler),
        'firefoxOS': null  // This is set below.
    };

    // Packaged-app installation are supported only on Firefox OS, so this is how we sniff.
    capabilities.gaia = !!(navigator.mozApps && navigator.mozApps.installPackage);

    // Detect Firefox OS.
    // This will be true if the request is from a Firefox OS phone *or*
    // a desktop B2G build with the correct UA pref, such as this:
    // https://github.com/mozilla/r2d2b2g/blob/master/prosthesis/defaults/preferences/prefs.js
    capabilities.firefoxOS = capabilities.gaia && !capabilities.firefoxAndroid;

    return capabilities;
});
