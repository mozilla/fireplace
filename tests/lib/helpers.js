var system = require('system');
var require = patchRequire(require);
var utils = require('utils');

var _ = require('../../node_modules/underscore');

var baseTestUrl = 'http://localhost:8675';
var _currTestId;


casper.on('viewport.changed', function(dimensions) {
    casper.echo('Viewport dimensions changed to: ' +
                dimensions[0] + 'x' + dimensions[1]);
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


if (system.env.SHOW_TEST_CONSOLE) {
    casper.on('remote.message', function(message) {
        casper.echo(message, 'INFO');
    });
    casper.on('page.error', function(message) {
        casper.echo(message, 'ERROR');
    });
}


function startCasper(options) {
    options = options || {};

    casper.options.waitTimeout = 10000;

    if (options.url) {
        casper.echo('"url" supplied, you probably meant "path"', 'WARNING');
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


function done(test) {
    casper.run(function() {
        test.done();
    });
}


function waitForPageLoaded(cb) {
    casper.waitForSelector('body.loaded', cb);
}


function makeUrl(path) {
    return baseTestUrl + path;
}


function assertContainsText(selector, msg) {
    // Check selector contains a string.
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


function assertWaitForSelector(test, selector, cb) {
    // Waits for selector and then asserts it at the same time.
    casper.waitForSelector(selector, function() {
        test.assertExists(selector);
        if (cb) {
            cb();
        }
    });
}


function checkValidity(selector) {
    // Returns validity of a form as a boolean.
    return casper.evaluate(function(sel) {
        return document.querySelector(sel).checkValidity();
    }, selector);
}


function assertUATracking(test, trackArgs) {
    // Check that a UA tracking event or variable change was made
    // by checking the tracking logs.
    // If trackArgs is a string, it will just check the first argument.
    var isString = false;
    if (trackArgs.constructor === String) {
        isString = true;
    }

    var trackExists = casper.evaluate(function(trackArgs, isString) {
        var track_log = require('tracking').track_log;

        // Compare two arrays.
        function arraysAreEqual(arrA, arrB) {
            return arrA.length == arrB.length &&
                arrA.every(function(element, index) {
                    return element === arrB[index];
                });
        }

        return track_log.filter(function(log) {
            if (isString) {
                return log[0] == trackArgs;
            }
            return arraysAreEqual(log, trackArgs);
        }).length !== 0;
    }, trackArgs, isString);

    if (!trackExists) {
        console.log(trackArgs);
    }
    test.assert(trackExists, 'Tracking event exists');
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

        if (target[0] == url &&
            !utils.equals(params, parseQueryString(target[1]))) {
            console.log('API url param mismatch:');
            console.log(JSON.stringify(params));
            console.log(JSON.stringify(parseQueryString(target[1])));
        }

        return target[0] == url &&
               utils.equals(params, parseQueryString(target[1]));
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


function fake_login(opts) {
    opts = opts || {};

    casper.evaluate(function(isAdmin) {
        console.log('[phantom] Performing fake login action');
        var user = window.require('user');
        var views = window.require('views');
        var z = window.require('z');

        user.set_token('mocktoken');
        user.update_apps({
            installed: [],
            developed: [424242],  // Hard-coded ID from the mock API.
            purchased: []
        });
        user.update_settings({
            carrier_sim: null,
            email: 'someemail123@mozilla.com',
            enable_recommendations: false,
            display_name: 'swarley',
            region_sim: null,
            region_geoip: 'us',
            source: 'firefox-accounts'
        });

        if (isAdmin) {
            user.update_permissions({
                'reviewer': true
            });
        }

        z.body.addClass('logged-in');
        z.page.trigger('reload_chrome');
        z.page.trigger('logged_in');

        views.reload();
    }, opts.isAdmin);
}


function changeViewportMobile() {
    casper.viewport(400, 300);
}


function changeViewportTablet() {
    casper.viewport(700, 768);
}


function changeViewportDesktop() {
    casper.viewport(1050, 768);
}


function setUpDesktop() {
    changeViewportDesktop();
}


function setUpTablet() {
    changeViewportTablet();
}


function tearDown() {
    changeViewportMobile();
}


function desktopTest(testObj) {
    // Wrapper around test object to set up desktop viewport.
    return _.extend(testObj, {
        setUp: setUpDesktop,
        tearDown: tearDown
    });
}


function tabletTest(testObj) {
    // Wrapper around test object to set up tablet viewport.
    return _.extend(testObj, {
        setUp: setUpTablet,
        tearDown: tearDown
    });
}


module.exports = {
    assertAPICallWasMade: assertAPICallWasMade,
    assertContainsText: assertContainsText,
    assertHasFocus: assertHasFocus,
    assertUATracking: assertUATracking,
    assertWaitForSelector: assertWaitForSelector,
    capture: capture,
    checkValidity: checkValidity,
    changeViewportDesktop: changeViewportDesktop,
    changeViewportMobile: changeViewportMobile,
    changeViewportTablet: changeViewportTablet,
    desktopTest: desktopTest,
    done: done,
    fake_login: fake_login,
    makeUrl: makeUrl,
    setUpDesktop: setUpDesktop,
    startCasper: startCasper,
    tabletTest: tabletTest,
    tearDown: tearDown,
    waitForPageLoaded: waitForPageLoaded,
};
