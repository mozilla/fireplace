define('settings_local', [], function() {
    return {
        api_url: 'https://marketplace.firefox.com',
        body_classes: 'package',
        media_url: 'https://marketplace.cdn.mozilla.net/media/',
        tracking_enabled: true,
        potatolytics_enabled: true,
        package_version: '{fireplace_package_version}'
    };
});
