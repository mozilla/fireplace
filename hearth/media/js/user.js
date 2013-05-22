define('user',
    ['capabilities', 'log', 'mobilenetwork', 'settings', 'storage', 'utils'],
    function(capabilities, log, mobilenetwork, site_settings, storage, utils) {

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

    function detect_mobile_network(navigator) {
        navigator = navigator || window.navigator;

        var GET = utils.getVars();
        var mcc;
        var mnc;
        var region;

        // Hardcoded carrier should never get overridden.
        var carrier = site_settings.carrier;
        if (carrier && typeof carrier === 'object') {
            carrier = carrier.slug;
        }
        carrier = carrier || GET.carrier || null;

        if (!carrier) {
            // Get mobile region and carrier information passed via querystring.
            mcc = GET.mcc;
            mnc = GET.mnc;
        }

        try {
            // When Fireplace is served as a privileged packaged app (and not
            // served via Yulelog) our JS will have direct access to this API.
            var conn = navigator.mozMobileConnection;
            if (conn) {
                // `MCC`: Mobile Country Code
                // `MNC`: Mobile Network Code
                // `lastKnownNetwork`: `{MCC}-{MNC}`
                var network = (conn.lastKnownNetwork || conn.lastKnownHomeNetwork || '-').split('-');
                mcc = network[0];
                mnc = network[1];
                console.log('MCC = ' + mcc + ', MNC = ' + mnc);
            } else {
                console.warn('Error accessing navigator.mozMobileConnection');
            }
        } catch(e) {
            // Fail gracefully if `navigator.mozMobileConnection` gives us problems.
            console.warn('Error accessing navigator.mozMobileConnection:', e);
        }

        if (mcc || mnc) {
            // Look up region and carrier from MCC (Mobile Country Code)
            // and MNC (Mobile Network Code).
            var network = mobilenetwork.getNetwork(mcc, mnc);
            region = network.region;
            carrier = network.carrier;
        }

        // Get region from settings saved to localStorage.
        region = settings.region || region;

        // If it turns out the region is null, when we get a response from an
        // API request, we look at the `API-Filter` header to determine the region
        // in which Zamboni geolocated the user.

        settings.carrier = carrier || null;
        settings.region = region || null;
    }

    detect_mobile_network(navigator);

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

    function get_setting(setting) {
        return settings[setting] || null;
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
        detect_mobile_network: detect_mobile_network,
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
