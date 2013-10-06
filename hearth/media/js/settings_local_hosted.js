define('settings_local', [], function() {
    var origin = window.location.origin || (
        window.location.protocol + '//' + window.location.host);
    return {
        api_url: origin,
        media_url: document.body.getAttribute('data-media') + 'fireplace/',
        tracking_enabled: true,
        
        potatolytics_enabled: false
    };
});
