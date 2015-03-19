var v;

if (require.globals) {
    // SlimerJS
    require.globals.casper = casper;
    casper.echo('Running under SlimerJS', 'WARN');
    v = slimer.version;
    casper.isSlimer = true;
} else {
    // PhantomJS
    casper.echo('Running under PhantomJS', 'WARN');
    v = phantom.version;
}
casper.echo('Version: ' + v.major + '.' + v.minor + '.' + v.patch);

// Require helpers.
function localRequire(path, name) {
    return require(require('fs').absolute(path));
}

if (require.globals) {
    require.globals.localRequire = localRequire;
}

function globalRequire(path, name) {
    var module = localRequire(path);
    if (require.globals) {
        require.globals[name] = module;
    }
    return module;
}

// Require globals.
var _ = globalRequire('node_modules/underscore/underscore', '_');
var helpers = globalRequire('tests/lib/helpers', 'helpers');
var constants = globalRequire('tests/lib/constants', 'constants');
var appList = globalRequire('tests/lib/app_list', 'appList');
