define('mobilenetwork',
       ['l10n', 'log', 'notification', 'settings', 'user', 'utils', 'views'],
       function(l10n, log, notification, settings, user, utils, views) {
    var console = log('mobilenetwork');
    var gettext = l10n.gettext;

    var regions = {
        // United States
        310: 'us',

        // United Kingdom
        235: 'uk',

        // Brazil
        724: 'br',

        // Spain
        214: 'es',

        // Colombia
        732: 'co',

        // Venezuela
        734: 've',

        // Poland
        260: 'pl',

        // Mexico
        334: 'mx',

        // Hungary
        216: 'hu',

        // Germany
        262: 'de'
    };

    var carriers = {
        // United States
        310: {
            26: 'deutsche_telekom',
            160: 'deutsche_telekom',
            170: 'deutsche_telekom',
            200: 'deutsche_telekom',
            210: 'deutsche_telekom',
            220: 'deutsche_telekom',
            230: 'deutsche_telekom',
            240: 'deutsche_telekom',
            250: 'deutsche_telekom',
            260: 'deutsche_telekom',
            270: 'deutsche_telekom',
            280: 'deutsche_telekom',
            290: 'deutsche_telekom',
            330: 'deutsche_telekom',
            490: 'deutsche_telekom',
            580: 'deutsche_telekom',
            660: 'deutsche_telekom',
            800: 'deutsche_telekom'
        },

        // United Kingdom
        235: {
            2: 'telefonica',
            10: 'telefonica',
            11: 'telefonica',
            30: 'deutsche_telekom'
        },

        // Brazil
        724: {
            6: 'telefonica',
            10: 'telefonica',
            11: 'telefonica',
            23: 'telefonica'
        },

        // Spain
        214: {
            5: 'telefonica',
            7: 'telefonica'
        },

        // Colombia
        732: {
            123: 'telefonica'
        },

        // Venezuela
        734: {
            4: 'telefonica'
        },

        // Poland
        260: {
            2: 'deutsche_telekom'
        },

        // Mexico
        334: {
            2: 'america_movil',
            20: 'america_movil',
            300: 'telefonica'
        },

        // Hungary
        216: {
            30: 'deutsche_telekom'
        },

        // Germany
        262: {
            1: 'deutsche_telekom',
            6: 'deutsche_telekom'
        },

        // Slovakia
        231: {
            2: 'deutsche_telekom',
            4: 'deutsche_telekom',
            6: 'telefonica'
        },

        // Czech Republic
        232: {
            2: 'telefonica'
        },

        // Austria
        232: {
            8: 'telefonica'
        },

        // Guatemala
        704: {
            3: 'telefonica'
        },

        // El Salvador
        706: {
            4: 'telefonica'
        },

        // Nicaragua
        710: {
            3: 'telefonica'
        },

        // Costa Rica
        712: {
            4: 'telefonica'
        },

        // Panama
        714: {
            2: 'telefonica',
            3: 'america_movil'
        },

        // Chile
        730: {
            2: 'telefonica'
        },

        // Ecuador
        740: {
            1: 'america_movil'
        },

        // Paraguay
        744: {
            4: 'telefonica',
        },

        // Peru
        716: {
            6: 'telefonica',
            10: 'america_movil'
        },

        // Argentina
        722: {
            10: 'telefonica',
            70: 'telefonica'
        },

        // Uruguay
        748: {
            7: 'telefonica'
        }
    };

    function getNetwork(mcc, mnc) {
        // Look up region and carrier from MCC (Mobile Country Code)
        // and MNC (Mobile Network Code).
        mcc = +mcc || 0;
        mnc = +mnc || 0;
        return {
            region: regions[mcc] || null,
            carrier: carriers[mcc] && carriers[mcc][mnc] || null
        };
    }

    function confirmRegion(currentRegion, newRegion) {
        // Ask user to switch to the new region we detected from the SIM card.
        var currentRegionName = settings.REGION_CHOICES_SLUG[currentRegion];
        var newRegionName = settings.REGION_CHOICES_SLUG[newRegion];
        var message = gettext(
            'You are currently browsing content for *{current_region}*. ' +
            'Would you like to switch to *{new_region}*?',
            {current_region: currentRegionName,
             new_region: newRegionName});
        $.when(notification.confirmation({message: message}))
         .fail(function() {
            console.log('User declined to change region from', currentRegionName, 'to', newRegionName);
         })
         .done(function() {
            console.log('User changed region from', currentRegionName, 'to', newRegionName);
            user.update_settings({region: newRegion});
            views.reload();
         });
    }

    function detectMobileNetwork(navigator, fake) {
        navigator = navigator || window.navigator;

        var GET = utils.getVars();
        var mcc;
        var mnc;
        var region;

        // Hardcoded carrier should never get overridden.
        var carrier = user.get_setting('carrier');
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
                // `lastKnownHomeNetwork`: `{MCC}-{MNC}` (SIM's origin)
                // `lastKnownNetwork`: `{MCC}-{MNC}` (could be different network if roaming)
                var network = (conn.lastKnownHomeNetwork || conn.lastKnownNetwork || '-').split('-');
                mcc = network[0];
                mnc = network[1];
                console.log('lastKnownNetwork', conn.lastKnownNetwork);
                console.log('lastKnownHomeNetwork', conn.lastKnownHomeNetwork);
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
            var network = getNetwork(mcc, mnc);
            region = network.region;
            carrier = network.carrier;
        }

        var newSettings = {};

        var lastRegion = user.get_setting('last_region');

        if (region && lastRegion && lastRegion != region) {
            confirmRegion(lastRegion, region);
            // Update the last region we detected from the SIM.
            newSettings.last_region = region;
        }

        // Get region from settings saved to localStorage.
        region = user.get_setting('region') || region;

        // If it turns out the region is null, when we get a response from an
        // API request, we look at the `API-Filter` header to determine the region
        // in which Zamboni geolocated the user.

        newSettings.carrier = carrier || null;
        newSettings.region = region || null;

        user.update_settings(newSettings);
    }

    detectMobileNetwork(navigator);

    return {
        detectMobileNetwork: detectMobileNetwork,
        getNetwork: getNetwork
    };
});
