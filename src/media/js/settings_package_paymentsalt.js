define('settings_local', [], function() {
    return {
        api_url: 'https://payments-alt.allizom.org',
        body_classes: 'package',
        iframe_installer_src: 'https://payments-alt.allizom.org/iframe-install.html',
        media_url: 'https://payments-alt-cdn.allizom.org/media/',
        tracking_enabled: true,
        potatolytics_enabled: true,
        package_version: '{fireplace_package_version}'
    };
});
