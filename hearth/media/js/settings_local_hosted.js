define('settings_local', [], function() {
    var origin = window.location.origin || (
        window.location.protocol + '//' + window.location.host);
    return {
        api_url: origin,
        tracking_enabled: true,
        
        // XXX: Please don't let this go into production.
        potatolytics_enabled: true
    };
});
