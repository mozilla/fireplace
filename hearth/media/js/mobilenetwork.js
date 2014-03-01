define('mobilenetwork',
       ['defer', 'l10n', 'log', 'settings', 'tracking', 'user', 'utils'],
       function(defer, l10n, log, settings, tracking, user, utils) {
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
        console.tagged('getNetwork').log('Trying MCC = ' + mcc + ', MNC = ' + mnc);

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

    function detectMobileNetwork(navigator) {
        var consoleTagged = console.tagged('detectMobileNetwork');
        navigator = navigator || window.navigator;

        var newSettings = {};

        var GET = utils.getVars();
        // Get mobile region and carrier information passed via querystring.
        var mcc = GET.mcc;
        var mnc = GET.mnc;
        var mccs = [];
        try {
            mccs = JSON.parse(GET.mccs || '[]');
        } catch(e) {
        }

        var region;
        var carrier = GET.carrier || user.get_setting('carrier') || null;

        var i;
        try {
            // navigator.mozMobileConnections is the new API.
            // navigator.mozMobileConnection is the legacy API.

            // When Fireplace is served as a privileged packaged app (and not
            // served via Yulelog) our JS will have direct access to this API.
            // Assignment not comparison below.
            var conn;
            if (conn = navigator.mozMobileConnections) {
                consoleTagged.log('navigator.mozMobileConnections available');
                if (mccs.length) {
                    consoleTagged.log('Using hardcoded MCCs:', JSON.stringify(mccs));
                } else {
                    // If we haven't hardcoded a MCC...
                    mccs = [];
                    var connData;
                    var network;
                    for (i = 0; i < conn.length; i++) {
                        connData = conn[i];
                        network = (connData.lastKnownHomeNetwork || connData.lastKnownNetwork || '-').split('-');
                        consoleTagged.log('navigator.mozMobileConnections[' + i + '].lastKnownNetwork:',
                                          connData.lastKnownNetwork);
                        consoleTagged.log('navigator.mozMobileConnections[' + i + '].lastKnownHomeNetwork:',
                                          conn.lastKnownHomeNetwork);
                        mccs.push({mcc: connData[0], mnc: connData[1]});
                    }
                    consoleTagged.log('Using SIM MCCs:', JSON.stringify(mccs));
                }
            } else if (conn = navigator.mozMobileConnection) {
                consoleTagged.log('navigator.mozMobileConnection available');
                // `MCC`: Mobile Country Code
                // `MNC`: Mobile Network Code
                // `lastKnownHomeNetwork`: `{MCC}-{MNC}` (SIM's origin)
                // `lastKnownNetwork`: `{MCC}-{MNC}` (could be different network if roaming)
                var lastNetwork = (conn.lastKnownHomeNetwork || conn.lastKnownNetwork || '-').split('-');
                mcc = lastNetwork[0];
                mnc = lastNetwork[1];
                consoleTagged.log('navigator.mozMobileConnection.lastKnownNetwork:',
                    conn.lastKnownNetwork);
                consoleTagged.log('navigator.mozMobileConnection.lastKnownHomeNetwork:',
                    conn.lastKnownHomeNetwork);
                consoleTagged.log('MCC:', mcc, ', MNC:', mnc);
            } else {
                consoleTagged.log('navigator.mozMobileConnection unavailable');
            }
        } catch(e) {
            // Fail gracefully if `navigator.mozMobileConnection(s)`
            // gives us problems.
            consoleTagged.warn('Error accessing navigator.mozMobileConnection:', e);
        }

        newSettings.carrier_sim = null;
        newSettings.region_sim = null;

        function setFromSIMPair(mcc, mnc, source) {
            // Look up region and carrier from MCC (Mobile Country Code)
            // and MNC (Mobile Network Code).
            var network = getNetwork(mcc, mnc);

            if (carrier !== network.carrier) {
                persistent_console.log(
                    'Carrier changed by ' + source + ':', carrier, '→', network.carrier);
            }

            region = newSettings.region_sim = network.region;
            carrier = newSettings.carrier_sim = network.carrier;

            return region;
        }

        if (mcc || mnc) {
            setFromSIMPair(mcc, mnc, 'SIM');
        }

        if (mccs.length) {
            var pair;
            for (i = 0; i < mccs.length; i++) {
                pair = mccs[i];
                consoleTagged.log('mccs[' + i + ']:', pair);
                if (setFromSIMPair(pair.mcc, pair.mnc, 'dual SIM')) {
                    break;
                }
            }
        }

        user.update_settings(newSettings);

        // Send the changed region to GA/UA.
        tracking.setVar(11, 'region', region);
    }

    detectMobileNetwork(navigator);

    return {
        carriers: carriers,
        detectMobileNetwork: detectMobileNetwork,
        getNetwork: getNetwork
    };
});
