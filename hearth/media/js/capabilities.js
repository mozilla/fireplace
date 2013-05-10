define('capabilities', [], function() {
    function safeMatchMedia(query) {
        var m = window.matchMedia(query);
        return !!m && m.matches;
    }

    return {
        'JSON': window.JSON && typeof JSON.parse === 'function',
        'debug': document.location.href.indexOf('dbg') >= 0,
        'debug_in_page': document.location.href.indexOf('dbginpage') >= 0,
        'console': window.console && typeof window.console.log === 'function',
        'replaceState': typeof history.replaceState === 'function',
        'chromeless': window.locationbar && !window.locationbar.visible,
        'webApps': !!(navigator.mozApps && navigator.mozApps.install),
        'app_runtime': !!(
            navigator.mozApps &&
            typeof navigator.mozApps.html5Implementation === 'undefined'
        ),
        'fileAPI': !!window.FileReader,
        'userAgent': navigator.userAgent,
        'widescreen': function() { return safeMatchMedia('(min-width: 710px)'); },
        'firefoxAndroid': navigator.userAgent.indexOf('Firefox') !== -1 && navigator.userAgent.indexOf('Android') !== -1,
        'touch': !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch),
        'nativeScroll': (function() {
            return 'WebkitOverflowScrolling' in document.createElement('div').style;
        })(),
        'performance': !!(window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance),
        'navPay': !!navigator.mozPay,
        'webactivities': !!(window.setMessageHandler || window.mozSetMessageHandler),
        'firefoxOS': navigator.mozApps && navigator.mozApps.installPackage &&
                     navigator.userAgent.indexOf('Android') === -1 &&
                     navigator.userAgent.indexOf('Mobile') !== -1,
        'phantom': navigator.userAgent.match(/Phantom/)  // Don't use this if you can help it.
    };

});
