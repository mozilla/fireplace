define('settings', ['settings_base', 'underscore'], function(settings_base, _) {
    // Override settings here!
    settings_base = _.defaults({
        api_url: 'http://flue.paas.allizom.org',
        body_classes: 'nightly'
    }, settings_base);
    return settings_base;
});
