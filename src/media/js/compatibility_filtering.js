/*
    Compatibility filtering. Also sets some default API arguments.

    Note that endpoint_name must be passed to views looking to use
    compatiibility filtering since the `select`s need an endpoint_name.
*/
define('compatibility_filtering',
    ['core/capabilities', 'core/l10n', 'core/log', 'core/storage', 'underscore', 'core/utils', 'core/z'],
    function(capabilities, l10n, log, storage, _, utils, z) {
    'use strict';
    var logger = log('compatibility_filtering');
    var gettext = l10n.gettext;

    var DEVICE_CHOICES = {
        'android-mobile': gettext('Android Mobile'),
        'android-tablet': gettext('Android Tablet'),
        'desktop': gettext('Desktop'),
        'firefoxos': gettext('Firefox OS'),
    };

    // API endpoints where feature profile is enabled, if all conditions met.
    // See api_args() below.
    var ENDPOINTS_WITH_FEATURE_PROFILE = [
        'category_landing', 'feed', 'feed-app', 'feed-brand', 'feed-collection',
        'feed-items', 'feed-shelf', 'installed', 'recommended',
        'new_popular_search', 'search'
    ];

    var actual_platform = '';
    var actual_formfactor = '';
    var limit = 24;
    var device_filter_name;
    var key = 'device_filtering_preferences';
    var device_override;
    var device_filtering_preferences;

    // Default feature profile signature.
    // a specially crafted signature that includes all features except the more
    // recent ones, to hide apps using more recent features from older
    // Marketplaces that have not been updated yet. Generated in Zamboni with:
    // f = FeatureProfile.from_signature('fffffffffffffffffffffffffff')
    // f.update({'mobileid': False,
    //           'precompile_asmjs': False,
    //           'hardware_512mb_ram': False,
    //           'hardware_1gb_ram': False})
    // f.to_signature()
    var default_feature_profile = '7fffffffffff0.51.6';
    // Get feature profile from query string (yulelog sets this), or fall back
    // to the default.
    var feature_profile = utils.getVars().pro || default_feature_profile;

    refresh_params();
    z.win.on('navigating', refresh_params);

    // By default, filter by platform and form factor.
    actual_platform = capabilities.device_platform();
    actual_formfactor = capabilities.device_formfactor();

    // For mobile phones, set limit to 10, otherwise use the default, 24.
    if (actual_formfactor == 'mobile' || actual_platform == 'firefoxos') {
        limit = 10;
    }

    // Build the name of the filter combination we are currently using.
    device_filter_name = capabilities.device_type();

    // On desktop, the default is no filtering.
    if (actual_platform == 'desktop') {
        actual_platform = '';
        device_filter_name = '';
    }

    // Filtering preferences per page group. The default is to follow the
    // default filter combination we just built above.
    device_filtering_preferences = {
        'category_landing': device_filter_name,
        'new_popular_search': device_filter_name,
        'recommended': device_filter_name,
        'search': device_filter_name,
    };
    device_filtering_preferences = _.extend(device_filtering_preferences,
                                            storage.getItem(key) || {});

    /* Refresh query string parameter override. Called when navigating. */
    function refresh_params(e) {
        device_override = utils.getVars().device_override;
    }

    /* Return whether the value passed in argument should be selected for the
     * seecified endpoint. */
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
        logger.log('Filtering for ' + endpoint_name + ' changed to ' + value);
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
        } else {
            // If device_filtering_preferences[endpoint_name] does not exist or
            // is an 'empty' value, then we use the default filtering behaviour
            // with whatever actual_platform and actual_formfactor are.
            args.dev = actual_platform;
            args.device = actual_formfactor;
        }
        args.limit = limit;
        if (actual_platform === 'firefoxos' &&
            actual_platform === args.dev &&
            actual_formfactor === args.device &&
            _.indexOf(ENDPOINTS_WITH_FEATURE_PROFILE, endpoint_name) >= 0) {
            // Include feature profile, but only if specific conditions are met:
            // - We are using a Firefox OS device
            // - We aren't showing 'all apps'
            // - We are dealing with an endpoint that knows how to handle feature profiles
            args.pro = feature_profile;
        }
        return args;
    }

    return {
        api_args: api_args,
        default_feature_profile: default_feature_profile,
        DEVICE_CHOICES: DEVICE_CHOICES,
        device_filter_name: device_filter_name,
        feature_profile: feature_profile,
        limit: limit,
        is_preference_selected: is_preference_selected,
        set_preference: set_preference
    };
});
