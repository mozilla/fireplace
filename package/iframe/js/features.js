var logger = require('./logger');


// Bump this number every time you add a feature. It must match zamboni's
// settings.APP_FEATURES_VERSION.
var APP_FEATURES_VERSION = 8;

function buildFeaturesPromises() {
    var promises = [];
    // The order matters - we'll push promises in the same order to
    // generate the features signature.
    var features = [
        // false,  // Hardcoded boolean value.
        // 'mozApps' in navigator,  // Dynamic boolean value.
        // ['hardware.memory', 512],  // getFeature() with comparison.
        // 'api.window.MozMobileNetworkInfo',  // hasFeature().

        // We are only interested in a few features for now. We're already
        // only doing this if getFeature() is present, and it was
        // introduced in 2.0, so we know we can hardcode anything that
        // comes with 2.0 and for which we don't need to know the exact
        // value.
        true, // 'getMobileIdAssertion' in window.navigator || 'api.window.Navigator.getMobileIdAssertion',
        true, // 'manifest.precompile',
        ['hardware.memory', 512],
        ['hardware.memory', 1024],
        true, // NFC
        'acl.version', // OpenMobile ACL
        // Don't add any more as long as bug 1172487 is not fixed, it won't
        // work correctly.
    ];

    features.forEach(function(key) {
        if (typeof key === 'boolean') {
            // Hardcoded boolean value, just pass it directly.
            promises.push(key);
        } else if (typeof key === 'string') {
            if (key === 'acl.version') {
                // This feature has a value, so we need to call
                // getFeature(), but we actually only care about the fact
                // that it's not empty, so we can just use the getFeature()
                // promise directly.
                promises.push(navigator.getFeature(key));
            } else if (typeof navigator.hasFeature !== 'undefined') {
                // Regular boolean feature: just call hasFeature().
                promises.push(navigator.hasFeature(key));
            } else {
                // We should be using hasFeature() but it's absent, return
                // false.
                promises.push(false);
            }
        } else {
            // We are dealing with a more complex case, where we need to
            // call getFeature() and compare against a value.
            var feature = key[0];
            var value = key[1];
            // We need to wrap the getFeature() Promise into one of our own
            // that does the comparison, so that we can just call
            // Promise.all later and get only booleans.
            promises.push(new Promise(function(resolve, reject) {
                navigator.getFeature(feature).then(function(data) {
                    resolve(data >= value);
                });
            }));
        }
    });
    return Promise.all(promises);
}

function generateFeatureProfile() {
    return buildFeaturesPromises().then(function(promises) {
        // Build the signature:
        // - First, get a binary representation of all the feature flags.
        //   the first 47 (!) are currently hardcoded as true.
        var hardcoded_signature_part = '11111111111111111111111111111111111111111111111';
        var features_int = parseInt(
            hardcoded_signature_part +
            promises.map(function(x) { return !!x ? '1' : '0'; }).join(''),
        2);
        var profile = [
            // First part is the hexadecimal string built from the array
            // containing the results from all the promises (which should
            // only be booleans);
            features_int.toString(16),
            // Second part is the number of features checked. The hardcoded
            // features are added to the number of promises we checked.
            promises.length + hardcoded_signature_part.length,
            // Last part is a hardcoded version number, to bump whenever
            // we make changes.
            APP_FEATURES_VERSION
        ].join('.');
        logger.log('Generated profile: ' + profile);
        return profile;
    });
}

module.exports = {
    generateFeatureProfile: generateFeatureProfile
};
