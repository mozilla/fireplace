var system = require('system');

var baseTestUrl = 'http://localhost:8675';
var _currTestId;
var require = patchRequire(require);
var utils = require('utils');

function makeUrl(path) {
    return baseTestUrl + path;
}


if (system.env.SHOW_TEST_CONSOLE) {
    casper.on('remote.message', function(message) {
        casper.echo('client console: ' + message, 'INFO');
    });
}


function startCasper(options) {
    options = options || {};
    if (options.url) {
        casper.echo('You supplied a "url" option when you probably meant "path"', 'WARNING');
    }
    var headers = options.headers;
    var path = options.path || '/';
    var url = baseTestUrl + path;
    casper.echo('Starting with url: ' + url);

    if (!headers) {
        casper.start(url);
    } else {
        casper.start();
        casper.echo(JSON.stringify(headers));
        casper.open(url, {headers: headers});
    }
}


// Check selector contains a string.
function assertContainsText(selector, msg) {
    msg = msg || 'Selector contains some text';
    casper.test.assert(!!casper.fetchText(selector).trim(), msg);
}


function assertHasFocus(selector, msg) {
    msg = msg || 'Selector has focus';
    var hasFocus = casper.evaluate(function(sel) {
        return document.querySelector(sel) === document.activeElement;
    }, selector);
    return casper.test.assert(hasFocus, msg);
}


function parseQueryString(qs) {
    var vars = {}, param, params;
    if (qs === undefined) {
        return {};
    }
    params = qs.split('&');
    for (var i = 0; i < params.length; i++) {
        param = params[i].split('=');
        vars[param[0]] = param[1];
    }
    return vars;
}

function assertAPICallWasMade(url, params, msg) {
    // Check if API call was made during test run.
    // Does not check *when* the call was made so be careful when using it.
    function testFn(res) {
        var target = res.url.split('?');

        // Log if the endpoint matches but not the params.
        /*
        console.log('API url param mismatch:');
        console.log(JSON.stringify(params));
        console.log(JSON.stringify(parseQueryString(target[1])));
        */

        return target[0] == url && utils.equals(params, parseQueryString(target[1]));
    }

    msg = msg || 'API call was made';
    url = casper.evaluate(function() {
        return require('settings').api_url;
    }) + url;

    return casper.test.assertResourceExists(testFn, msg);
}


function capture(filename) {
    var file = 'tests/captures/' + filename;
    casper.echo('Capturing: ' + file, 'INFO');
    casper.capture(file);
}


function makeToken() {
    // Return a random ascii string.
    return Math.random().toString(36).slice(2);
}

casper.on('viewport.changed', function(dimensions) {
    casper.echo('Viewport dimensions changed to: ' + dimensions[0] + 'x' + dimensions[1]);
});

casper.on('started', function() {
    _currTestId = makeToken();
    casper.echo('Starting test', 'INFO');
});


casper.on('waitFor.timeout', function() {
    var filename = 'timeout-' + _currTestId + '.png';
    casper.echo('Timeout screenshot at ' + filename);
    capture(filename);
});


casper.on('step.error', function() {
    var filename = 'fail-' + _currTestId + '.png';
    casper.echo('Test failure screenshot at ' + filename);
    capture(filename);
});


function fake_login() {
    casper.evaluate(function() {
        console.log('[phantom] Performing fake login action');
        window.require('user').set_token("it's fine, it's fine");
        window.require('user').update_apps({
            'installed': [],
            'developed': [424242],  // Hard-coded ID from the mock API.
            'purchased': []
        });
        var z = window.require('z');
        z.body.addClass('logged-in');
        z.page.trigger('reload_chrome');
        z.page.trigger('logged_in');

        window.require('views').reload();
    });
}

module.exports = {
    assertAPICallWasMade: assertAPICallWasMade,
    assertContainsText: assertContainsText,
    assertHasFocus: assertHasFocus,
    capture: capture,
    fake_login: fake_login,
    makeUrl: makeUrl,
    startCasper: startCasper,
};
