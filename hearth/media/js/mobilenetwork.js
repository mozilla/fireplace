define('mobilenetwork',
       ['defer', 'l10n', 'log', 'notification', 'settings', 'user', 'utils'],
       function(defer, l10n, log, notification, settings, user, utils) {
    var console = log('mobilenetwork');
    var persistent_console = log.persistent('mobilenetwork', 'change');
    var gettext = l10n.gettext;

    var REGIONS = settings.REGION_CHOICES_SLUG;

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

        // Greece
        202: 'gr',

        // Mexico
        334: 'mx',

        // Hungary
        216: 'hu',

        // Germany
        262: 'de',

        // Uruguay
        748: 'uy',

        // Serbia
        220: 'rs',

        // Montenegro
        297: 'me',

        // China
        460: 'cn',

        // Japan
        440: 'jp'
    };

    var carriers = [
        'america_movil',
        'carrierless',
        'china_unicom',
        'deutsche_telekom',
        'etisalat',
        'hutchinson_three_group',
        'kddi',
        'kt',
        'megafon',
        'qtel',
        'singtel',
        'smart',
        'sprint',
        'telecom_italia_group',
        'telefonica',
        'telenor',
        'tmn',
        'vimpelcom'
    ];

    var carriersRegions = {
        // United States
        // 26, 160, 170, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290
        // 330, 490, 580, 660, 800, 310...
        310: 'deutsche_telekom',

        // United Kingdom
        235: {
            2: 'telefonica',
            10: 'telefonica',
            11: 'telefonica',
            30: 'deutsche_telekom'
        },

        // Brazil
        // 6, 10, 11, 23
        724: 'telefonica',

        // Spain
        // 5, 7
        214: 'telefonica',

        // Colombia
        // 102, 123
        732: 'telefonica',

        // Venezuela
        734: {
            4: 'telefonica'
        },

        // Poland
        260: {
            2: 'deutsche_telekom'
        },

        // Greece
        202: {
            // This actually belongs to Vodafone, which DT owns
            5: 'deutsche_telekom'
        },

        // Mexico
        334: {
            2: 'america_movil',
            3: 'telefonica',
            20: 'america_movil'
        },

        // Hungary
        216: {
            1: 'telenor',
            30: 'deutsche_telekom',
            // Actually Vodafone but treat like DT
            70: 'deutsche_telekom'
        },

        // Germany
        // 1, 6
        262: 'deutsche_telekom',

        // Slovakia
        231: {
            2: 'deutsche_telekom',
            4: 'deutsche_telekom',
            6: 'telefonica'
        },

        // Czech Republic
        // Austria
        // 2, 8
        232: 'telefonica',

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
            70: 'telefonica',
            // Claro
            310: 'america_movil',
            320: 'america_movil',
            330: 'america_movil'
        },

        // Uruguay
        748: {
            7: 'telefonica',
            // Claro.
            10: 'america_movil',
        },

        // Serbia
        // 1, 2
        220: 'telenor',

        // Montenegro
        297: {
            1: 'telenor'
        },

        // China
        // 1, 3, 6
        460: 'china_unicom',

        // Japan
        // 7, 8, 49, 50, 51, 52, 53, 54, 55, 56, 70, 71, 72, 73, 74, 75, 76,
        // 77, 79, 88, 89
        440: 'kddi',
    };

    function getNetwork(mcc, mnc) {
        // Look up region and carrier from MCC (Mobile Country Code)
        // and MNC (Mobile Network Code).

        // Strip leading zeros and make it a string.
        mcc = (+mcc || 0) + '';
        mnc = (+mnc || 0) + '';

        // Workaround for Polish SIMs (bug 876391, bug 880369).
        if (mcc === '260' && mnc[0] === '2') {
            mnc = 2;
        }
        // Colombia.
        if (mcc === '732' && mnc[0] === '1') {
            mnc = 123;
        }
        // Spain.
        if (mcc === '214') {
            if (mnc[0] === '5') {
                mnc = 5;
            }
            if (mnc[0] === '7') {
                mnc = '7';
            }
        }

        // Make them integers.
        mcc = +mcc || 0;
        mnc = +mnc || 0;

        var carrier = carriersRegions[mcc];

        // If it's a string, the carrier is the same for every MNC.
        // If it's an object, the carrier is different based on the MNC.
        if (typeof carrier === 'object') {
            carrier = carrier[mnc];
        }

        return {
            region: regions[mcc] || null,
            carrier: carrier || null
        };
    }

    function confirmRegion(currentRegion, newRegion) {
        // Ask user to switch to the new region we detected from the SIM card.
        var currentRegionName = REGIONS[currentRegion];
        var newRegionName = REGIONS[newRegion];
        var message = gettext('You are currently browsing content for *{current_region}*. Would you like to switch to *{new_region}*?',
            {current_region: currentRegionName,
             new_region: newRegionName});

        notification.confirmation({message: message}).fail(function() {
            persistent_console.log('User cancelled region change:', currentRegionName, '→', newRegionName);
        }).done(function() {
            persistent_console.log('User confirmed SIM region change:', currentRegionName, '→', newRegionName);
            user.update_settings({region: newRegion});
            // window.location.reload() is weird on Firefox OS.
            window.location = window.location.href;
        });
    }

    function detectMobileNetwork(navigator, fake) {
        navigator = navigator || window.navigator;

        var newSettings = {};

        var region;
        var GET = utils.getVars();
        // Get mobile region and carrier information passed via querystring.
        var mcc = GET.mcc;
        var mnc = GET.mnc;

        var carrier = GET.carrier || user.get_setting('carrier') || null;

        try {
            // When Fireplace is served as a privileged packaged app (and not
            // served via Yulelog) our JS will have direct access to this API.
            var conn = navigator.mozMobileConnection;
            if (conn) {
                // `MCC`: Mobile Country Code
                // `MNC`: Mobile Network Code
                // `lastKnownHomeNetwork`: `{MCC}-{MNC}` (SIM's origin)
                // `lastKnownNetwork`: `{MCC}-{MNC}` (could be different network if roaming)
                var lastNetwork = (conn.lastKnownHomeNetwork || conn.lastKnownNetwork || '-').split('-');
                mcc = lastNetwork[0];
                mnc = lastNetwork[1];
                console.log('lastKnownNetwork', conn.lastKnownNetwork);
                console.log('lastKnownHomeNetwork', conn.lastKnownHomeNetwork);
                console.log('MCC = ' + mcc + ', MNC = ' + mnc);
            } else {
                console.warn('navigator.mozMobileConnection unavailable');
            }
        } catch(e) {
            // Fail gracefully if `navigator.mozMobileConnection` gives us problems.
            console.warn('Error accessing navigator.mozMobileConnection:', e);
        }

        newSettings.sim_carrier = GET.carrier;
        newSettings.sim_region = GET.region;

        if (mcc || mnc) {
            // Look up region and carrier from MCC (Mobile Country Code)
            // and MNC (Mobile Network Code).
            var network = getNetwork(mcc, mnc);

            newSettings.sim_carrier = network.carrier;
            newSettings.sim_region = network.region;

            region = network.region;

            if (carrier !== network.carrier) {
                persistent_console.log('Carrier changed by SIM:', carrier, '→', network.carrier);
            }
            carrier = network.carrier;
        }

        var lastRegion = user.get_setting('last_region');

        if (region && lastRegion !== region) {
            persistent_console.log('Detected new region from SIM:', region);
            if (lastRegion) {
                confirmRegion(lastRegion, region);
            }
            // Update the last region we detected from the SIM.
            newSettings.last_region = region;
        }

        // Get region from settings saved in memory (in the `settings` object).
        if (GET.region === '') {  // Ability to set region to worldwide from query params
            region = '';
        } else {
            region = (GET.region in REGIONS && GET.region) || user.get_setting('region') || region;
        }

        // If it turns out the region is null, when we get a response from an
        // API request, we look at the `API-Filter` header to determine the region
        // in which Zamboni geolocated the user.

        // Hardcoded carrier should never get overridden.
        if (settings.carrier && typeof settings.carrier === 'object') {
            carrier = settings.carrier.slug;
        }

        newSettings.carrier = carrier || null;
        newSettings.region = region || null;

        user.update_settings(newSettings);
    }

    detectMobileNetwork(navigator);

    return {
        carriers: carriers,
        detectMobileNetwork: detectMobileNetwork,
        getNetwork: getNetwork
    };
});
