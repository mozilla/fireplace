define('settings_local', [], function() {
    return {
        // api_url: 'https://marketplace-dev.allizom.org',
        api_url: 'http://flue.paas.allizom.org',
        media_url: document.body.getAttribute('data-media'),
        tracking_enabled: true,
        potatolytics_enabled: true,
        body_classes: 'nightly'
    };
});
