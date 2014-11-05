define('settings_local', [], function() {
    return {
        api_url: window.location.origin,
        media_url: document.body.getAttribute('data-media'),
        iframe_installer_src: origin + '/iframe-install.html',
        iframe_potatolytics_src: origin + '/potatolytics.html',
        potatolytics_enabled: false,
        tracking_enabled: true,
    };
});
