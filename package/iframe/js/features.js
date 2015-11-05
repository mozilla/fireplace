var logger = require('./logger');

// Bump this number every time you add a feature. It must match zamboni's
// settings.APP_FEATURES_VERSION.
var APP_FEATURES_VERSION = 9;

// See zamboni docs for the order - it matters, we'll push promises in the same
// order to generate the features signature.
var FEATURES = [
    // false,  // Hardcoded boolean value.
    // 'mozApps' in navigator,  // Dynamic boolean value.
    // ['hardware.memory', 512],  // getFeature() with comparison.
    // 'api.window.MozMobileNetworkInfo',  // hasFeature().

    // We are only interested in a few features for now. We're already only
    // doing this if getFeature() is present, and it was introduced in 2.0, so
    // we know we can hardcode anything that comes with 2.0 and for which we
    // don't need to know the exact value.
    true, // 'getMobileIdAssertion' in window.navigator || 'api.window.Navigator.getMobileIdAssertion',
    true, // 'manifest.precompile',
    ['hardware.memory', 512],
    ['hardware.memory', 1024],
    true, // NFC
    'acl.version', // OpenMobile ACL,
    'api.window.UDPSocket',
];

function FeaturesBitField(size) {
    /**
     * Class that stores the bits into several 8-bit unsigned integers, and 
     * can import/export from/to base64. Designed that way to be compatible
     * with the way we read the features signature in Python.
    **/
    this.size = size;
    this.values = new Uint8Array(Math.ceil(this.size / 8));
}

FeaturesBitField.prototype.get = function(i) {
    var index = (i / 8) | 0;
    var bit = i % 8;
    return (this.values[index] & (1 << bit)) !== 0;
};

FeaturesBitField.prototype.set = function(i, value) {
    var index = (i / 8) | 0;
    var bit = i % 8;
    if (value) {
        this.values[index] |= 1 << bit;
    } else {
        this.values[index] &= ~(1 << bit);
    }
};

FeaturesBitField.prototype.toBase64 = function() {
    return btoa(String.fromCharCode.apply(null, this.values));
};


function buildFeaturesPromises(features, navigator) {
    navigator = navigator || window.navigator;
    var promises = [];
    // Execute getFeature('hardware.memory') immediately and store the promise
    // to be able to re-use it without making the call twice.
    var memoryPromise = navigator.getFeature('hardware.memory');

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
                var getFeaturePromise;
                if (feature == 'hardware.memory') {
                    getFeaturePromise = memoryPromise;
                } else {
                    getFeaturePromise = navigator.getFeature(feature);
                }
                getFeaturePromise.then(function(data) {
                    resolve(data >= value);
                });
            }));
        }
    });
    return Promise.all(promises);
}

function generateFeatureProfile(features, navigator) {
    navigator = navigator || window.navigator;
    features = features || FEATURES;
    return buildFeaturesPromises(features, navigator).then(function(values) {
        // Build the signature:
        // - First, get a binary representation of all the feature flags.
        //   the first 47 (!) are currently hardcoded as true.
        var hardcoded_len = 47;
        var bitfield = new FeaturesBitField(values.length + hardcoded_len);
        for (var i = 0; i < hardcoded_len; i++) {
            bitfield.set(i, true);
        }
        for (i = 0; i < values.length; i++) {
            bitfield.set(hardcoded_len + i, values[i]);
        }
        var profile = [
            // First part is the base64 string built from the bitfield
            // containing the results from all the values; A '=' is prepended
            // to indicate that it's going to be a base64 signature.
            '=' + bitfield.toBase64(),
            // Second part is the number of features;
            bitfield.size,
            // Last part is a hardcoded version number, to bump whenever
            // we make changes.
            APP_FEATURES_VERSION
        ].join('.');
        return profile;
    });
}

/*
 * Utility function that converts an object to an array of objects.
 * Used because Promise.all() does not accept an object for its iterable, it
 * really wants an array :(.
 */
function mapPromisesObjectToArray(obj) {
    // Function that returns a function to use as the promise callback.
    var makeArrayEntry = function(key) {
        return function(value) {
            return {name: key, value: value};
        };
    };

    return Object.keys(obj).map(function(key) {
        // Push a promise that resolves to a {name: ..., value: ...} object.
        return obj[key].then(makeArrayEntry(key));
    });
}

/*
 * Utility function that converts an array of objects to an object.
 * Companion to mapPromisesObjectToArray above.
 */
function mapArrayToObject(arr) {
    var obj = {};

    for (var i = 0; i < arr.length; i ++) {
        // Build the object from each {name: ..., value: ...} object in the
        // array.
        obj[arr[i].name] = arr[i].value;
    }

    return obj;
}

/**
 * Check for extra features that do not have feature flags.
 *
 * Returns a promise that is fulfilled when all checks are complete. Its value
 * is an object containing booleans indicating whether the features are
 * enabled, like this:
 * {
 *   addonsEnabled: true,
 *   homescreensEnabled: false,
 *   ...
 * }
 */
function checkForExtraFeatures(navigator) {
    navigator = navigator || window.navigator;

    if (typeof navigator.hasFeature === 'undefined') {
        return new Promise(function(resolve, reject) {
            // Resolve immediately with no data if we haven't hasFeature().
            resolve({});
        })
    }

   var promises = {
        addonsEnabled: navigator.hasFeature('web-extensions'),
        homescreensEnabled: navigator.hasFeature('manifest.role.homescreen'),
        lateCustomizationEnabled: navigator.hasFeature('late-customization'),
    };

    return Promise.all(mapPromisesObjectToArray(promises)).then(function(res) {
        return mapArrayToObject(res);
    });
}

module.exports = {
    FeaturesBitField: FeaturesBitField,
    buildFeaturesPromises: buildFeaturesPromises,
    checkForExtraFeatures: checkForExtraFeatures,
    generateFeatureProfile: generateFeatureProfile,
};
