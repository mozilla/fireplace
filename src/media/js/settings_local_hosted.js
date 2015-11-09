define('settings_local',
    ['core/polyfill'],
    function(polyfill) {

    // Require polyfill to set window.location.origin.
    var origin = window.location.origin;

    return {
        api_url: origin,
        manifest_url: origin + '/packaged.webapp',
        media_url: document.body.getAttribute('data-media'),
        iframe_installer_src: origin + '/iframe-install.html',
        iframe_potatolytics_src: origin + '/potatolytics.html',
        potatolytics_enabled: false,
        tracking_enabled: true,
        addonsEnabled: window.location.search.indexOf('addonsEnabled=true') !== -1,
        homescreensEnabled: window.location.search.indexOf('homescreensEnabled=true') !== -1,
        lateCustomizationEnabled: window.location.search.indexOf('lateCustomizationEnabled=true') !== -1,
        meowEnabled: true
    };
});
