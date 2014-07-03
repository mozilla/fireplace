define('settings_local', [], function() {
    var origin = window.location.origin || (
        window.location.protocol + '//' + window.location.host);
    return {
        api_url: origin,
        media_url: document.body.getAttribute('data-media'),
        iframe_installer_src: origin + '/iframe-install.html',
        potatolytics_enabled: false,
        tracking_enabled: true,
    };
});
