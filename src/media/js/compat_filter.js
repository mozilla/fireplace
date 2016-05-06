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
        'app', 'category', 'feed', 'feed-app', 'feed-brand', 'feed-collection',
        'feed-items', 'feed-shelf', 'installed', 'recommended', 'search'
    ];
    var featureProfile = utils.getVars().pro || '7fffffffffff0.51.6';

    // Don't do device filtering for these endpoints.
    var EXCLUDE_DEVICE_FILTER_ENDPOINTS = ['feed-app'];

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
    var filterDevice = caps.device_type();

    z.body.attr('data-platform', actualPlatform);

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
        // Force everything to be 'firefoxos' since that's all we support now.
        var api = {
            dev: 'firefoxos',
            device: actualFormFactor,
            limit: limit
        };

        // Keep feature profile param if device is actually FxOS.
        if (actualPlatform === 'firefoxos' &&
            _.indexOf(ENDPOINTS_WITH_FEATURE_PROFILE, endpoint) >= 0) {
            api.pro = featureProfile;
        }

        return api;
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
