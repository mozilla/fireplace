define('settings_local', ['settings_base', 'underscore'], function(settings_base, _) {
    settings_base = _.defaults({
        api_url: 'http://flue.paas.allizom.org'
    }, settings_base);
    return settings_base;
});
