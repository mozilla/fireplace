var activities = require('./activities');
var features = require('./features');
var logger = require('./logger');
var messages = require('./messages');
var translations = require('./translations');


logger.log('MKT_URL:', process.env.MKT_URL);

function buildQS(profile, extraFeatures) {
    var qs = [];

    try {
        // navigator.mozMobileConnections is the new API.
        // navigator.mozMobileConnection is the legacy API.
        var conn = navigator.mozMobileConnections;
        var network;
        if (conn) {
            logger.log('navigator.mozMobileConnections available');
            var mccs = [];
            var connData;
            for (var i = 0; i < conn.length; i++) {
                connData = conn[i];
                // Testing lastKnownHomeNetwork first is important, because it's the
                // only one which contains the SPN.
                network = (connData.lastKnownHomeNetwork || connData.lastKnownNetwork || '-').split('-');
                logger.log('navigator.mozMobileConnections[' + i + '].lastKnownNetwork:',
                    connData.lastKnownNetwork);
                logger.log('navigator.mozMobileConnections[' + i + '].lastKnownHomeNetwork:',
                    conn.lastKnownHomeNetwork);
                mccs.push({mcc: network[0], mnc: network[1], spn: network[2]});
            }
            mccs = JSON.stringify(mccs);
            qs.push('mccs=' + mccs);
            logger.log('MCCs: ' + mccs);
        } else {
            logger.log('navigator.mozMobileConnections unavailable');

            conn = navigator.mozMobileConnection;
            if (conn) {
                logger.log('navigator.mozMobileConnection available');
                // `MCC`: Mobile Country Code
                // `MNC`: Mobile Network Code
                // `lastKnownHomeNetwork`: `{MCC}-{MNC}` (SIM's origin)
                // `lastKnownNetwork`: `{MCC}-{MNC}` (could be different network if roaming)
                network = (conn.lastKnownHomeNetwork || conn.lastKnownNetwork || '-').split('-');
                qs.push('mcc=' + (network[0] || ''));
                qs.push('mnc=' + (network[1] || ''));
                logger.log('navigator.mozMobileConnection.lastKnownNetwork:',
                    conn.lastKnownNetwork);
                logger.log('navigator.mozMobileConnection.lastKnownHomeNetwork:',
                    conn.lastKnownHomeNetwork);
                logger.log('MCC: "' + network[0] + '", MNC: "' + network[1] + '"');
            } else {
                logger.log('navigator.mozMobileConnection unavailable');
            }
        }
    } catch(e) {
        // Fail gracefully if `navigator.mozMobileConnection(s)`
        // gives us problems.
    }

    if ('id' in navigator) {
        qs.push('nativepersona=true');
    }

    if (profile) {
        logger.log('Generated profile: ' + profile);
        qs.push('pro=' + encodeURIComponent(profile));
    }

    if (extraFeatures) {
        Object.keys(extraFeatures).forEach(function(key) {
            logger.log(key + ': ' + extraFeatures[key]);
            if (extraFeatures[key]) {
                qs.push(key + '=true');
            }
        });
    }

    return qs.join('&');
}

// The iframe src is served over https, which means that if the system date
// is too far behind, the user will just end up seeing a certificate error.
// We check against an hardcoded year corresponding to the current certificate
// creation date, and display an error message if necessary.
function isSystemDateIncorrect() {
    logger.log('Checking for system date ...');
    var rval = new Date().getFullYear() < 2015;
    if (rval) {
        logger.log('System date appears to be incorrect!');
    } else {
        logger.log('System date appears to be OK.');
    }
    return rval;
}

if (isSystemDateIncorrect()) {
    document.body.classList.add('dateerror');

    document.querySelector('.try-again').addEventListener('click', function() {
        if (!isSystemDateIncorrect()) {
            window.location.reload();
        }
    }, false);
} else {
    // Build the iframe. If we have Promise and getFeature, we build the
    // profile signature first.
    if (typeof window.Promise !== 'undefined' &&
        typeof navigator.getFeature !== 'undefined') {
        logger.log('navigator.getFeature and window.Promise available');
        var allStartupPromises = Promise.all([
            features.generateFeatureProfile(),
            features.checkForExtraFeatures(),
        ]);
        allStartupPromises.then(function(promises) {
            var featureProfile = promises[0];
            var extraFeatures = promises[1];
            launchIframe(featureProfile, extraFeatures);
        });
    } else {
        logger.log('navigator.getFeature or window.Promise unavailable :(');
        launchIframe();
    }

    // When refocussing the app, toggle the iframe based on `navigator.onLine`.
    window.addEventListener('focus', toggleOffline, false);

    toggleOffline(true);

    document.querySelector('.try-again').addEventListener('click', function() {
        toggleOffline();
    }, false);
}

function launchIframe(profile, hasWebExtensions) {
    // Set the iframe src to the actual Marketplace.
    var iframe = document.getElementById('iframe');
    iframe.onerror = function() {
        document.body.classList.add('offline');
    };
    iframe.src = process.env.MKT_URL +
                 '/?' + buildQS(profile, hasWebExtensions);
}

function toggleOffline(init) {
    logger.log('Checking for network connection ...');
    if (navigator.onLine === false) {
        // Hide iframe.
        logger.log('Network connection not found; hiding iframe ...');
        document.body.classList.add('offline');
    } else {
        // Show iframe.
        logger.log('Network connection found; showing iframe ...');
        if (!init) {
            // Reload the page to reload the iframe.
            window.location.reload();
        }
    }
}

// Set up messages, activities and translations late in order to load the
// iframe as quickly as possible.
translations.install();
messages.install();
activities.install();
