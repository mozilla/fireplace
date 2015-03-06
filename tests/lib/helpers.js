var system = require('system');
var require = patchRequire(require);
var utils = require('utils');

var _ = require('../../node_modules/underscore');

var mozApps = require('./mozApps');

var baseTestUrl = 'http://localhost:8675';
var mobileViewportSize = [320, 480];
var viewportSize = mobileViewportSize;
var pageAlreadyLoaded = false;
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


if (system.env.SHOW_TEST_CONSOLE || system.env.TEST_CONSOLE_FILTER) {
    // Show client console logs. Setting TEST_CONSOLE_FILTER to a value with
    // match and filter console logs for debugging.
    casper.on('remote.message', function(message) {
        if (!system.env.TEST_CONSOLE_FILTER ||
            message.indexOf(system.env.TEST_CONSOLE_FILTER) !== -1) {
            casper.echo(message, 'INFO');
        }
    });
    casper.on('page.error', function(message) {
        casper.echo(message, 'ERROR');
    });
}


var viewports = {
    desktop: setUpDesktop,
    tablet: setUpTablet,
};


function selectOption(sel, val) {
    // Equivalent to clicking an option on the dropdown.
    casper.evaluate(function(sel, val) {
        $(sel).val(val).change();
    }, sel, val);
}


function startCasper(path, opts) {
    if (path && path.constructor === Object) {
        opts = path;
        path = opts.path || opts.url || '/';
    } else if (path === undefined) {
        path = '/';
    }
    opts = opts || {};

    casper.options.waitTimeout = 5000;

    var url = makeUrl(path);
    casper.echo('Opening ' + url);
    if (viewports.hasOwnProperty(opts.viewport)) {
        viewports[opts.viewport]();
    }
    setViewport();

    mozApps.initialize();

    if (opts.headers) {
        casper.echo(JSON.stringify(opts.headers));
        casper.open(url, {headers: opts.headers});
    } else {
        casper.open(url);
    }
}


function done(test) {
    casper.run(function() {
        test.done();
    });
}


function waitForAppDetail(cb) {
    casper.waitForSelector('[data-page-type~="detail"]', cb);
}


function waitForAppList(cb) {
    casper.waitForSelector('.app-list', cb);
}


function waitForFeedItem(cb) {
    casper.waitForSelector('.feed-item-item', cb);
}


function waitForLoggedIn(cb) {
    casper.waitForSelector('body.logged-in', cb);
}


function waitForPageLoaded(cb) {
    if (pageAlreadyLoaded) {
        casper.echo('Waiting for page load but page has already loaded. Use ' +
                    'helpers.waitForPageLoadedAgain if this is intentional.',
                    'WARNING');
    } else {
        pageAlreadyLoaded = true;
    }
    waitForPageLoadedAgain(cb);
}


function waitForPageLoadedAgain(cb) {
    if (!pageAlreadyLoaded) {
        casper.echo('Waiting for additional page load but page has not ' +
                    'loaded. Please use helpers.waitForPageLoaded instead.',
                    'WARNING');
    }
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


function assertUASendEvent(test, trackArgs) {
    // Check that a UA tracking event or variable change was made
    // by checking the tracking logs.
    // If trackArgs is a string, it will just check the first argument.
    if (trackArgs.constructor !== String) {
        trackArgs = ['send', 'event'].concat(trackArgs);
    }
    return assertUATrackingLog(test, trackArgs);
}


function assertUASetSessionVar(test, trackArgs) {
    if (trackArgs.constructor !== String) {
        trackArgs = ['set'].concat(trackArgs);
    }
    return assertUATrackingLog(test, trackArgs);
}


function assertUATrackingLog(test, trackArgs) {
    var trackExists = casper.evaluate(function(trackArgs) {
        var _ = window.require('underscore');
        var trackLog = window.require('tracking').trackLog;

        return trackLog.filter(function(log) {
            console.log(JSON.stringify(log));
            console.log(JSON.stringify(trackArgs));
            if (trackArgs.constructor === String) {
                // Just compare event name for convenience.
                return log[2] == trackArgs;
            }
            return _.isEqual(log, trackArgs);
        }).length !== 0;
    }, trackArgs);

    if (!trackExists) {
        console.log(JSON.stringify(trackArgs));
    }
    test.assert(trackExists, 'Tracking event exists');
}


function filterUALogs(trackArgs) {
    // Given an array, filter UA log that matches the array.
    return casper.evaluate(function(trackArgs) {
        var _ = window.require('underscore');
        var trackLog = window.require('tracking').trackLog.reverse();

        return trackLog.filter(function(log) {
            return _.isEqual(log.slice(0, trackArgs.length), trackArgs);
        });
    }, trackArgs);
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
        return require('core/settings').api_url;
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
        var user = window.require('core/user');
        var views = window.require('core/views');
        var z = window.require('core/z');

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


function setUpDesktop() {
    viewportSize = [1050, 768];
}


function setUpTablet() {
    viewportSize = [700, 768];
}


function setViewport() {
    casper.viewport(viewportSize[0], viewportSize[1]);
}


casper.test.setUp(function() {
    pageAlreadyLoaded = false;
    casper.start();
});


function tearDown() {
    viewportSize = mobileViewportSize;
}


casper.test.tearDown(tearDown);


module.exports = {
    assertAPICallWasMade: assertAPICallWasMade,
    assertContainsText: assertContainsText,
    assertHasFocus: assertHasFocus,
    assertUASendEvent: assertUASendEvent,
    assertUASetSessionVar: assertUASetSessionVar,
    assertWaitForSelector: assertWaitForSelector,
    capture: capture,
    checkValidity: checkValidity,
    done: done,
    fake_login: fake_login,
    filterUALogs: filterUALogs,
    makeUrl: makeUrl,
    selectOption: selectOption,
    startCasper: startCasper,
    tearDown: tearDown,
    waitForAppDetail: waitForAppDetail,
    waitForAppList: waitForAppList,
    waitForFeedItem: waitForFeedItem,
    waitForLoggedIn: waitForLoggedIn,
    waitForPageLoaded: waitForPageLoaded,
    waitForPageLoadedAgain: waitForPageLoadedAgain,
};
