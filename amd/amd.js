(function(window, undefined) {

var defined = {};
var resolved = {};
var console = window.console;

function define(id, deps, module) {
    defined[id] = [deps, module];
}
define.amd = {jQuery: true};

function require(id) {

    if (!resolved[id]) {

        var definition = defined[id];

        if (!definition) {
            throw 'Attempted to resolve undefined module ' + id;
        }

        var deps = definition[0];
        var module = definition[1];

        if (typeof deps == 'function' && module === undefined) {
            module = deps;
            deps = [];
        }

        try {
            deps = deps.map(require);
        } catch(e) {
            console.error('Error initializing dependencies: ', id);
            throw e;
        }
        try {
            resolved[id] = module.apply(window, deps);
        } catch(e) {
            console.error('Error initializing module: ', id);
            throw e;
        }

    }
    return resolved[id];
}

require.config = function() {};

window.require = require;
window.define = define;

'replace me';

if ('log' in defined) {
    console = require('log')('amd');
}
var settings = require('settings');
require(settings.init_module);

})(window, void 0);
