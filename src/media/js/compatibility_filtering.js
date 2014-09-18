define('compatibility_filtering',
    ['buckets', 'capabilities', 'log', 'storage', 'underscore', 'utils', 'z'],
    function(buckets, capabilities, log, storage, _, utils, z) {

    var dev = '';
    var device = '';
    var limit = 25;
    var device_filter_name;
    var key = 'device_filtering_preferences';
    var console = log('compatibility_filtering');
    var device_override;
    var device_filtering_preferences;

    refresh_params();
    z.win.on('navigating', refresh_params);

    // By default, filter by device everywhere but on desktop.
    if (capabilities.firefoxOS) {
        // Currently we don't distinguish between mobile & tablet on FirefoxOS,
        // so don't set device.
        dev = 'firefoxos';
    } else if (capabilities.firefoxAndroid) {
        dev = 'android';
        device = capabilities.widescreen() ? 'tablet' : 'mobile';
    }

    // For mobile phones, set limit to 10, otherwise use the default, 25.
    if (device == 'mobile' || dev == 'firefoxos') {
        limit = 10;
    }

    // Build the name of the filter combination we are currently using.
    if (dev && device) {
        device_filter_name = dev + '-' + device;
    } else {
        // Can be '', which is fine, it's the default for desktop (no filtering).
        device_filter_name = dev;
    }

    // Filtering preferences per page group. The default is to follow the
    // default filter combination we just built above.
    device_filtering_preferences = {
        'category_landing': device_filter_name,
        'new_popular_search': device_filter_name,
        'search': device_filter_name
    };
    device_filtering_preferences = _.extend(device_filtering_preferences,
                                            storage.getItem(key) || {});

    /* Refresh query string parameter override. Called when navigating */
    function refresh_params(e) {
        device_override = utils.getVars().device_override;
    }

    /* Return whether the value passed in argument should be selected for the
     * specified endpoint. */
    function is_preference_selected(endpoint_name, value) {
        if (value == 'all' && !device_filter_name) {
            // Special case: On desktop, where device_filter_name is empty,
            // 'all' is the default behaviour. So in this case, treat 'all'
            // as '', which is the value for 'follow the default filtering'.
            value = '';
        }
        if (device_override) {
            return device_override == value;
        } else {
            return device_filtering_preferences[endpoint_name] == value;
        }
    }

    /* Set a new filtering preference value for the specified endpoint. */
    function set_preference(endpoint_name, value) {
        console.log('Filtering for ' + endpoint_name + ' changed to ' + value);
        device_filtering_preferences[endpoint_name] = value;
        storage.setItem(key, device_filtering_preferences);
    }

    /* Return base API args to use for the specified endpoint. routes_api_args
     * adds a couple generic ones on top of these. */
    function api_args(endpoint_name) {
        var args = {}, pref;

        pref = device_override || device_filtering_preferences[endpoint_name];
        if (pref) {
            // If we have a device filtering preference for that endpoint,
            // or an override was given in the query string, extract it.
            pref = pref.split('-');
            if (pref.length > 1) {
                args.dev = pref[0];
                args.device = pref[1];
            } else if (pref[0] != 'all') {
                args.dev = pref[0];
                args.device = '';
            } else {
                // 'all' means no dev/device filtering at all.
                args.dev = '';
                args.device = '';
            }
        }
        else {
            // If device_filtering_preferences[endpoint_name] does not exist or
            // is an 'empty' value, then we use the default filtering behaviour
            // with whatever dev and device are.
            args.dev = dev;
            args.device = device;
        }
        args.limit = limit;
        args.pro = buckets.profile;
        return args;
    }

    return {
        api_args: api_args,
        device_filter_name: device_filter_name,
        is_preference_selected: is_preference_selected,
        set_preference: set_preference
    };
});
