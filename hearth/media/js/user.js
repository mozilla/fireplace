define('user',
    ['capabilities', 'log', 'storage', 'utils'],
    function(capabilities, log, storage, utils) {

    var console = log('user');

    var token;
    var settings = {};
    var permissions = {};

    var save_to_ls = !capabilities.phantom;

    if (save_to_ls) {
        token = storage.getItem('user');
        log.unmention(token);
        settings = JSON.parse(storage.getItem('settings') || '{}');
        permissions = JSON.parse(storage.getItem('permissions') || '{}');
    }

    if (save_to_ls) {
        save_settings();
    }

    function clear_settings() {
        settings = {};
    }

    function clear_token() {
        console.log('Clearing user token');

        storage.removeItem('user');
        if ('email' in settings) {
            delete settings.email;
            save_settings();
            permissions = {};
            save_permissions();
        }
        token = null;
    }

    function get_setting(setting, default_) {
        return settings[setting] || default_;
    }

    function get_permission(setting) {
        return permissions[setting] || false;
    }

    function get_settings() {
        return settings;
    }

    function set_token(new_token, new_settings) {
        console.log('Setting new user token');
        if (!new_token) {
            return;
        }
        token = new_token;
        // Make sure that we don't ever log the user token.
        log.unmention(new_token);

        // If we're allowed to save to localStorage, do that now.
        if (save_to_ls) {
            storage.setItem('user', token);
        }

        // Update the user's settings with the ones that are in the
        // login API response.
        update_settings(new_settings);
    }

    function save_settings() {
        if (save_to_ls) {
            console.log('Saving settings to localStorage');
            storage.setItem('settings', JSON.stringify(settings));
        } else {
            console.log('Settings not saved to localStorage');
        }
    }

    function update_settings(data) {
        if (!data) {
            return;
        }
        console.log('Updating user settings', data);
        _.extend(settings, data);
        save_settings();
    }

    function save_permissions() {
        if (save_to_ls) {
            console.log('Saving permissions to localStorage');
            storage.setItem('permissions', JSON.stringify(permissions));
        } else {
            console.log('Permissions not saved to localStorage');
        }
    }

    function update_permissions(data) {
        if (!data) {
            return;
        }
        console.log('Updating user permissions', data);
        permissions = data;
        save_permissions();
    }

    return {
        clear_settings: clear_settings,
        clear_token: clear_token,
        get_setting: get_setting,
        get_permission: get_permission,
        get_settings: get_settings,
        get_token: function() {return token;},
        logged_in: function() {return !!token;},
        set_token: set_token,
        update_settings: update_settings,
        update_permissions: update_permissions
    };
});
