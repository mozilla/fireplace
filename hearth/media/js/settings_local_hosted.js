define('settings_local', [], function() {
    var origin = window.location.origin || (
        window.location.protocol + '//' + window.location.host);
    return {api_url: origin};
});
