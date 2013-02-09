define('settings', ['settings_base'], function(settings_base) {
    // Override settings here!
    settings_base = _.defaults(settings_base, {});
    return settings_base;
});
