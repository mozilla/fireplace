define('mobilenetwork',
    ['carriers', 'core/l10n', 'core/log', 'regions', 'tracking', 'core/user', 'core/utils'],
    function(carriers, l10n, log, regions, tracking, user, utils) {
    var console = log('mobilenetwork');
    var persistent_console = log.persistent('mobilenetwork', 'change');
    var gettext = l10n.gettext;

    var carriersRegions = carriers.MOBILE_CODES;

    function getNetwork(mcc, mnc, spn) {
        console.tagged('getNetwork').log('Trying MCC = ' + mcc + ', MNC = ' + mnc + ', SPN = ' + spn);

        // Look up region and carrier from MCC (Mobile Country Code)
        // and MNC (Mobile Network Code).

        // Strip leading zeros and make it a string.
        mcc = (+mcc || 0) + '';
        mnc = (+mnc || 0) + '';

        // Already a string or undefined, make it a lowercase string.
        spn = (spn || '').toLowerCase();

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

        var carrier = carriersRegions[mcc];

        // If it's a string, the carrier is the same for every MNC.
        // If it's an object, the carrier is different based on the MNC or SPN.
        if (typeof carrier === 'object') {
            carrier = carrier[mnc];

            // Some carriers share the same MCC but have a different SPN to
            // tell them apart.
            if (typeof carrier === 'object') {
                carrier = carrier[spn] || carrier.__default;
            }
        }

        return {
            region: regions.MOBILE_CODES[mcc] || null,
            carrier: carrier || null
        };
    }

    // Parse and return mcc/mnc from a MozMobileConnection object.
    function handleConnection(conn, console) {
        function mccify(network) {
            var mccParts = (network || '-').split('-');
            if (mccParts.length < 2) {
                return null;
            }
            // mccParts contains at least mcc and mnc. Recent implementations
            // includes the SPN as a third parameter, if it's not present we'll
            // just return undefined, it's fine.
            return {mcc: mccParts[0], mnc: mccParts[1], spn: mccParts[2]};
        }
        // Testing lastKnownHomeNetwork first is important, because it's the
        // only one which contains the SPN.
        var lastNetwork = mccify(conn.lastKnownHomeNetwork ||
                                 conn.lastKnownNetwork);
        console.log('lastKnownNetwork: ' + conn.lastKnownNetwork +
                    ', lastKnownHomeNetwork: ' + conn.lastKnownHomeNetwork);
        if (lastNetwork) {
            console.log('Using network: ' + lastNetwork);
            return lastNetwork;
        } else {
            console.log('Unknown network.');
            return {mcc: undefined, mnc: undefined, spn: undefined};
        }
    }

    function detectMobileNetwork(navigator, _utils) {
        var GET = (_utils || utils).getVars();
        var carrier = GET.carrier || user.get_setting('carrier') || null;
        var consoleTagged = console.tagged('detectMobileNetwork');
        var newSettings = {};
        var mccs, region, source, i, triplet;

        navigator = navigator || window.navigator;
        newSettings.carrier_sim = null;
        newSettings.region_sim = null;

        // Array of sources to look at, in order. Each source function returns
        // either an Array of mcc/mnc objects, or a falsey value.
        var sources = [
            ['GET mcc/mnc', getMCCMNCSPN],
            ['GET mccs', getMCCs],
            ['dual SIM', getMultiSIM],
            ['SIM', getSIM],
            ['None', noNetwork],
        ];

        // Loop through the sources, continue as long as the result is falsey.
        // The first source to return a non-falsey value is the one we'll use.
        for (i = 0; i < sources.length && !mccs; i++) {
            source = sources[i][0];
            mccs = sources[i][1]();
        }

        if (mccs.length) {
            // Go through the list of mcc/mnc, try to extract network information
            // from each, stop as soon as we have a valid region, storing the
            // result in the settings.
            for (i = 0; i < mccs.length; i++) {
                triplet = mccs[i];
                consoleTagged.log('mccs[' + i + ']:', triplet);
                // Look up region and carrier from mcc/mnc/spn, applying
                // workarounds for special cases.
                var network = getNetwork(triplet.mcc, triplet.mnc, triplet.spn);

                if (carrier !== network.carrier) {
                    persistent_console.log('Carrier changed by ' + source + ':',
                                           carrier, '→', network.carrier);
                }

                if (network.region) {
                    region = newSettings.region_sim = network.region;
                    carrier = newSettings.carrier_sim = network.carrier;
                    break;
                }
            }
        }

        user.update_settings(newSettings);

        // Potential sources used by detectMobileNetwork() are defined below:

        // Get mobile region and carrier information passed via mcc/mnc/spn
        // querystring parameters.
        function getMCCMNCSPN() {
            if (GET.mcc || GET.mnc || GET.spn) {
                return [{mcc: GET.mcc, mnc: GET.mnc, spn: GET.spn}];
            }
        }

        // Get mobile region and carrier information passed via a single 'mccs'
        // querystring parameter containing multiple mcc/mnc pairs.
        function getMCCs() {
            try {
                return JSON.parse(GET.mccs);
            } catch(e) {}
        }

        // Get mcc/mnc/spn triplets using mozMobileConnections (needs to be privileged).
        function getMultiSIM() {
            try {
                if (navigator.mozMobileConnections) {
                    consoleTagged.log('navigator.mozMobileConnections available');
                    var mccs = [],
                        conns = navigator.mozMobileConnections;
                    for (var i = 0; i < conns.length; i++) {
                        mccs.push(handleConnection(conns[i], consoleTagged));
                    }
                    return mccs;
                }
            } catch(e) {
                // Fail gracefully if `navigator.mozMobileConnection(s)`
                // gives us problems.
                consoleTagged.warn('Error accessing navigator.mozMobileConnections:', e);
            }
        }

        // Get a single mcc/mnc/spn triplet using mozMobileConnection (needs to be privileged,
        // legacy API from before mozMobileConnections was introduced).
        function getSIM() {
            try {
                if (navigator.mozMobileConnection) {
                    consoleTagged.log('navigator.mozMobileConnection available');
                    return [handleConnection(navigator.mozMobileConnection, consoleTagged)];
                }
            } catch(e) {
                // Fail gracefully if `navigator.mozMobileConnection`
                // gives us problems.
                consoleTagged.warn('Error accessing navigator.mozMobileConnection:', e);
            }
        }

        // Fallback.
        function noNetwork() {
            consoleTagged.log('navigator.mozMobileConnection(s) unavailable and no GET parameter provided');
            return [];
        }
    }

    detectMobileNetwork(navigator);

    return {
        carriersRegions: carriersRegions,
        carriers: carriers.CARRIER_SLUGS,
        detectMobileNetwork: detectMobileNetwork,
        getNetwork: getNetwork,
        regions: regions.MOBILE_CODES,
    };
});
