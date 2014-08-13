var baseTestUrl = 'http://localhost:8675';
var _currTestId;

function makeUrl(path) {
    return baseTestUrl + path;
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
            'developed': [424242],  // Hardcoded in flue as the id for the 'developer' app.
            'purchased': []
        });
        var z = window.require('z');
        z.body.addClass('logged-in');
        z.page.trigger('reload_chrome');
        z.page.trigger('logged_in');

        require('views').reload();
    });
}

module.exports = {
    assertContainsText: assertContainsText,
    assertHasFocus: assertHasFocus,
    capture: capture,
    fake_login: fake_login,
    makeUrl: makeUrl,
    startCasper: startCasper,
};
