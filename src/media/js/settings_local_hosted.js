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
        addonsEnabled: false,
        meowEnabled: true,
        gametimeEnabled: true,
    };
});
