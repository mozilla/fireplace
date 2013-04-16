define([], function() {

    var capabilities = [
        'mozApps' in navigator,
        'mozApps' in navigator && navigator.mozApps.installPackage,
        'mozPay' in navigator,
        'MozActivity' in window,
        'ondevicelight' in window,
        'ArchiveReader' in window,
        'battery' in navigator,
        'mozBluetooth' in navigator,
        'mozContacts' in navigator,
        'getDeviceStorage' in navigator,
        window.mozIndexedDB || window.indexedDB,
        'geolocation' in navigator && 'getCurrentPosition' in navigator.geolocation,
        'addIdleObserver' in navigator && 'removeIdleObserver' in navigator,
        'mozConnection' in navigator && (navigator.mozConnection.metered === true || navigator.mozConnection.metered === false),
        'mozNetworkStats' in navigator,
        'ondeviceproximity' in window,
        'mozPush' in navigator || 'push' in navigator,
        'ondeviceorientation' in window,
        'mozTime' in navigator,
        'vibrate' in navigator,
        'mozFM' in navigator || 'mozFMRadio' in navigator,
        'mozSms' in navigator,
        !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)
    ];

    var profile = parseInt(capabilities.map(function(x) {return !!x ? '1' : '0';}).join(''), 2);
    // Add a count.
    profile += '.' + capabilities.length;
    // Add a version number.
    profile += '.1';

    return {
        get_profile: function() {return profile;}
    };

});
