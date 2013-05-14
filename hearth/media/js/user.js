define('user', ['capabilities', 'log'], function(capabilities, log) {

    var console = log('user');

    var token;
    var settings = {};
    var permissions = {};

    var save_to_ls = !capabilities.phantom;

    if (save_to_ls) {
        token = localStorage.getItem('user');
        log.unmention(token);
        settings = JSON.parse(localStorage.getItem('settings') || '{}');
        permissions = JSON.parse(localStorage.getItem('permissions') || '{}');
    }

    function clear_token() {
        console.log('Clearing user token');

        localStorage.removeItem('user');
        if ('email' in settings) {
            delete settings.email;
            save_settings();
            permissions = {};
            save_permissions();
        }
        token = null;
    }

    function get_setting(setting) {
        return settings[setting];
    }

    function get_permission(setting) {
        return permissions[setting] || false;
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
            localStorage.setItem('user', token);
        }

        // Update the user's settings with the ones that are in the
        // login API response.
        update_settings(new_settings);
    }

    function save_settings() {
        if (save_to_ls) {
            console.log('Saving settings to localStorage');
            localStorage.setItem('settings', JSON.stringify(settings));
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
            localStorage.setItem('permissions', JSON.stringify(permissions));
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
        clear_token: clear_token,
        get_setting: get_setting,
        get_permission: get_permission,
        get_token: function() {return token;},
        logged_in: function() {return !!token;},
        set_token: set_token,
        update_settings: update_settings,
        update_permissions: update_permissions
    };
});
