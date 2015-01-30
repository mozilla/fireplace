define('settings_local',
    ['core/polyfill', 'core/settings', 'core/urls', 'settings_app'],
    function(polyfill, settings, urls, appSettings) {

    // Require polyfill to set window.location.origin.
    var origin = window.location.origin;
    settings._extend({
        api_url: origin,
        manifest_url: origin + '/packaged.webapp',
        media_url: document.body.getAttribute('data-media'),
        iframe_installer_src: origin + '/iframe-install.html',
        iframe_potatolytics_src: origin + '/potatolytics.html',
        potatolytics_enabled: false,
        tracking_enabled: true,
    });
});
