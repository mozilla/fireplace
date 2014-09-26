var config = require('commonplace').config;
var extend = require('node.extend');

var LIB_DEST_PATH = config.LIB_DEST_PATH;

var localConfig = extend(true, {
    bowerConfig: {
        'document-register-element/build/document-register-element.max.js': config.LIB_DEST_PATH,
        'flipsnap/flipsnap.js': config.LIB_DEST_PATH,
        'isotope/dist/isotope.pkgd.js': config.LIB_DEST_PATH
    },
    requireConfig: {
        paths: {
            'document-register-element': 'lib/document-register-element.max',
            'flipsnap': 'lib/flipsnap',
            'hammerjs': 'hammer',
            'isotope': 'lib/isotope.pkgd'
        },
        shim: {
            'flipsnap': {
                'exports': 'Flipsnap'
            },
            'document-register-element': {
                'exports': 'window.document.registerElement'
            }
        }
    }
}, config);

localConfig.inlineRequireConfig = config.makeInlineRequireConfig(
    localConfig.requireConfig);

module.exports = localConfig;
