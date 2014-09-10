define('settings_local', [], function() {
    return {
        api_url: 'https://marketplace-dev.allizom.org',
        body_classes: 'package',
        iframe_installer_src: 'https://marketplace-dev.allizom.org/iframe-install.html',
        iframe_potatolytics_src: 'https://marketplace-dev.allizom.org/potatolytics.html',
        media_url: 'https://marketplace-dev.mozflare.net/media/',
        tracking_enabled: true,
        potatolytics_enabled: true,
        package_version: '{fireplace_package_version}'
    };
});
