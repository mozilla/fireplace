define('settings', ['settings_base', 'underscore'], function(settings_base, _) {
    // Override settings here!
    settings_base = _.defaults({}, settings_base);
    return settings_base;
});
