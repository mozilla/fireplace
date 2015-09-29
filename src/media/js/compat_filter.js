/*
    Compatibility filtering and device filtering. Mainly used to add arguments
    to the API router's processor. It also handles `limit` since that can be
    affected by the device or form factor.

    Device filtering is affected by a dropdown found above app lists. When the
    dropdown is changed, we will persist the new device filtering preference
    globally and across sessions.

    For desktop, device filtering is off by default at the moment.

    For feature profiles, if not in querystring, we default to a feature
    profile sig that is specially crafted.  Includes all features except more
    recent ones to hide apps using more recent features from older Marketplaces
    that have not been updated yet. Generated in Zamboni with:
        f = FeatureProfile.from_signature('fffffffffffffffffffffffffff')
        f.update({'mobileid': False, 'precompile_asmjs': False,
                  'hardware_512mb_ram': False, 'hardware_1gb_ram': False})
        f.to_signature()
*/
define('compat_filter',
    ['core/capabilities', 'core/l10n', 'core/log', 'core/settings',
     'core/storage', 'core/utils', 'core/views', 'core/z', 'underscore'],
    function(caps, l10n, log, settings,
             storage, utils, views, z, _) {
    'use strict';
    var logger = log('compat_filter');
    var gettext = l10n.gettext_lazy;
    var limit = 24;

    // Endpoints where feat. profile enabled if conditions met. See apiArgs().
    var ENDPOINTS_WITH_FEATURE_PROFILE = [
        'category', 'feed', 'feed-app', 'feed-brand', 'feed-collection',
        'feed-items', 'feed-shelf', 'installed', 'recommended', 'search'
    ];
    var featureProfile = utils.getVars().pro || '7fffffffffff0.51.6';

    // Don't do device filtering for these endpoints.
    var EXCLUDE_DEVICE_FILTER_ENDPOINTS = ['feed-app', 'games-daily',
                                           'games-listing'];

    var DEVICE_CHOICES = {
        '': gettext('All Platforms'),
        'android-mobile': gettext('Android Mobile'),
        'android-tablet': gettext('Android Tablet'),
        'desktop': gettext('Desktop'),
        'firefoxos': gettext('Firefox OS'),
    };

    // Calculate device filter choices.
    var DEVICE_FILTER_CHOICES = [
        ['all', gettext('All Platforms')],
        ['desktop', gettext('Desktop')],
        ['firefoxos', gettext('Firefox OS')],
        ['android-mobile', gettext('Android Mobile')],
        ['android-tablet', gettext('Android Tablet')]
    ];

    var actualPlatform = caps.device_platform();
    var actualFormFactor = caps.device_formfactor();
    var filterDeviceLSKey = 'filter-device';
    var filterDeviceFromLS = storage.getItem(filterDeviceLSKey);
    var filterDevice = filterDeviceFromLS || caps.device_type();

    z.body.attr('data-platform', actualPlatform);

    z.body.on('change', '.compat-filter', function() {
        // Update device preferences and reload view to refresh changes.
        if (this.value === undefined) {
            return;
        }
        filterDevice = this.value;
        storage.setItem(filterDeviceLSKey, filterDevice);
        logger.log('Filtering: ' + filterDevice);
        views.reload();
    });

    // For mobile, set limit to 10.
    if (actualFormFactor == 'mobile' || actualPlatform == 'firefoxos') {
        limit = 10;
    }

    function isDeviceSelected(value) {
        // Return whether value should be currently selected.
        if (value == 'all' && !filterDevice) {
            // Special case: on desktop, where filterDevice is empty.
            // 'all' is default behaviour -> 'follow default filtering'.
            value = '';
        }
        return filterDevice == value;
    }

    function apiArgs(endpoint) {
        // Return API args to use for API router's processor.
        var args = {};
        var pref = filterDevice;

        if (pref && EXCLUDE_DEVICE_FILTER_ENDPOINTS.indexOf(endpoint) === -1) {
            // If have device filter preference, extract it.
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
            // If filterDevice does not exist or is empty value, use default
            // filtering according to actualPlatform and actualFormfactor.
            args.dev = actualPlatform;
            args.device = actualFormFactor;
        }
        args.limit = limit;
        if (actualPlatform === 'firefoxos' &&
            actualPlatform === args.dev &&
            actualFormFactor === args.device &&
            _.indexOf(ENDPOINTS_WITH_FEATURE_PROFILE, endpoint) >= 0) {
            /*
                Include feature profile, but only if we:
                    Are using a Firefox OS device.
                    Aren't showing 'all apps'.
                    Are dealing with endpoint that can handle feature profile.
            */
            args.pro = featureProfile;
        }
        return args;
    }

    function getFilterDevice() {
        return filterDevice;
    }

    var initialDeviceText;
    DEVICE_FILTER_CHOICES.forEach(function(choice) {
        if (choice[0] == (filterDevice || 'all')) {
            initialDeviceText = choice[1];
        }
    });

    return {
        DEVICE_CHOICES: DEVICE_CHOICES,
        DEVICE_FILTER_CHOICES: DEVICE_FILTER_CHOICES,
        apiArgs: apiArgs,
        featureProfile: featureProfile,
        getFilterDevice: getFilterDevice,
        initialDeviceText: initialDeviceText,
        isDeviceSelected: isDeviceSelected,
        limit: limit,
    };
});
