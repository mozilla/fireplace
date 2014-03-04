define('user',
    ['capabilities', 'log', 'storage', 'utils'],
    function(capabilities, log, storage, utils) {

    var console = log('user');

    var token;
    var settings = {};
    var permissions = {};
    var apps = {
        'installed': [],
        'purchased': [],
        'developed': []
    };

    var save_to_ls = !capabilities.phantom;

    if (save_to_ls) {
        token = storage.getItem('user');
        log.unmention(token);
        settings = JSON.parse(storage.getItem('settings') || '{}');
        permissions = JSON.parse(storage.getItem('permissions') || '{}');
        var _stored = storage.getItem('user_apps');
        if (_stored) {
            apps = JSON.parse(_stored);
        }
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
            apps = {
                'installed': [],
                'purchased': [],
                'developed': []
            };
            save_apps();
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

    function get_apps() {
        return apps;
    }

    function has_developed(app_id) {
        return apps.developed.indexOf(app_id) !== -1;
    }

    function has_installed(app_id) {
        return apps.installed.indexOf(app_id) !== -1;
    }

    function has_purchased(app_id) {
        return apps.purchased.indexOf(app_id) !== -1;
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

    function update_apps(data) {
        if (!data) {
            return;
        }
        console.log('Updating user apps', data);
        apps = data;
        save_apps();
    }

    function update_install(app_id) {
        console.log('Adding to user apps.installed', app_id);
        apps.installed.push(app_id);
        save_apps();
    }

    function update_purchased(app_id) {
        console.log('Adding to user apps.purchased', app_id);
        apps.purchased.push(app_id);
        save_apps();
    }

    function save_apps() {
        if (save_to_ls) {
            console.log('Saving user apps to localStorage');
            storage.setItem('user_apps', JSON.stringify(apps));
        } else {
            console.log('User apps not saved to localStorage');
        }
    }

    return {
        clear_settings: clear_settings,
        clear_token: clear_token,
        get_apps: get_apps,
        get_permission: get_permission,
        get_setting: get_setting,
        get_settings: get_settings,
        get_token: function() {return token;},
        has_developed: has_developed,
        has_installed: has_installed,
        has_purchased: has_purchased,
        logged_in: function() {return !!token;},
        set_token: set_token,
        update_apps: update_apps,
        update_install: update_install,
        update_permissions: update_permissions,
        update_purchased: update_purchased,
        update_settings: update_settings,
    };
});
