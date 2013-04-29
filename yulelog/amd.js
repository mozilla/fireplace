(function(window, undefined) {

var defined = {};
var resolved = {};

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

        resolved[id] = module.apply(window, deps.map(require));

    }
    return resolved[id];
}

require.config = function() {};

window.require = require;
window.define = define;

'replace me';

require('marketplace');

})(window, void 0);
