var allTestFiles = ['init'];
var TEST_REGEXP = /tests\/.*\.js$/i;

// Automatically clenaup sinon spies and stubs.
var realSinon = sinon;
beforeEach(function() {
    sinon = realSinon.sandbox.create();
});
afterEach(function() {
    sinon.restore();
    sinon = realSinon;
});

function withSettings(changes, test) {
    var settings = require('core/settings');
    var changed = {};
    Object.keys(changes).forEach(function(key) {
        // Remember if it exists so we can delete it if it doesn't.
        if (key in settings) {
            changed[key] = settings[key];
        }
        settings[key] = changes[key];
    });
    test();
    Object.keys(changes).forEach(function(key) {
        if (key in changed) {
            settings[key] = changed[key];
        } else {
            delete settings[key];
        }
    });
}

var pathToModule = function(path) {
    return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
        // Normalize paths to RequireJS module names.
        allTestFiles.push(pathToModule(file));
    }
});

function bowerPath(path) {
    return '../../../bower_components/' + path;
}

require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base/src/media/js',

    paths: {
        'carriers': 'lib/carriers',
        'collection_colors': 'lib/collection_colors',
        'core': bowerPath('marketplace-core-modules/core'),
        'document-register-element': 'lib/document-register-element.max',
        'flipsnap': 'lib/flipsnap',
        'fxpay': 'lib/fxpay.min',
        'jquery': 'lib/jquery',
        'marketplace-elements': 'lib/marketplace-elements',
        'regions': 'lib/regions',
        'salvattore': 'lib/salvattore',
        'Squire': bowerPath('squire/src/Squire'),
        'templates': '../../templates',
        'tests': '../../../tests',
        'underscore': 'lib/underscore',
    },

    shim: {
        'document-register-element': {
            'exports': 'window.document.registerElement'
        },
        'flipsnap': {
            'exports': 'Flipsnap'
        },
        'fxpay': {
            'exports': 'fxpay'
        },
        'marketplace-elements': {
            'exports': 'window.document.registerElement',
            'deps': ['document-register-element'],
        },
        'salvattore': {
            'exports': 'salvattore'
        },
        'underscore': {
            'exports': '_',
        },
    },
});


// Using this instead of `deps` and `callback` in the `require.config` seems to
// prevent Squire from causing tests to run twice.
require(allTestFiles, function() {
    window.__karma__.start();
});
