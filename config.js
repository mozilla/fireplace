var config = require('commonplace').config;
var extend = require('node.extend');

var LIB_DEST_PATH = config.LIB_DEST_PATH;

var localConfig = extend(true, {
    bowerConfig: {
        // Bower configuration for which files to get, and where to put them.
        // [Source, excluding bower_components]: [Destination].
        'document-register-element/build/document-register-element.max.js': config.LIB_DEST_PATH,
        'flipsnap/flipsnap.js': config.LIB_DEST_PATH,
        'jquery-bridget/jquery.bridget.js': config.LIB_DEST_PATH,
        'isotope/dist/isotope.pkgd.js': config.LIB_DEST_PATH
    },
    cssBundles: {
        'splash.css': ['splash.styl.css']
    },
    cssExcludes: ['fxa.css', 'splash.styl.css'],
    requireConfig: {
        // RequireJS configuration for development, notably files in lib/.
        // [Module name]: [Module path].
        paths: {
            'document-register-element': 'lib/document-register-element.max',
            'flipsnap': 'lib/flipsnap',
            'isotope': 'lib/isotope.pkgd',
            'jquery-bridget/jquery.bridget': 'lib/jquery.bridget'
        },
        shim: {
            'flipsnap': {
                'exports': 'Flipsnap'
            },
            'document-register-element': {
                'exports': 'window.document.registerElement'
            }
        }
    },
    BOWER_PATH: config.BOWER_PATH || 'bower_components/',
    PORT: 8675
}, config);

localConfig.inlineRequireConfig = config.makeInlineRequireConfig(
    localConfig.requireConfig);

module.exports = localConfig;
