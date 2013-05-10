var base_url = 'http://localhost:8675/';
if (window.casper) {
    base_url = casper.cli.get(1) || base_url;
}
if (base_url[base_url.length - 1] !== '/') {
    base_url += '/';
}

function assert(cobj) {
    var me = this;
    this.asserts = 0;
    function wrap(func) {
        return function() {
            func.apply(cobj.test, arguments);
            me.asserts++;
        };
    }
    this.that = wrap(cobj.test.assert);
    this.equal = wrap(cobj.test.assertEquals);
    this.visible = wrap(cobj.test.assertVisible);
    this.invisible = wrap(cobj.test.assertNotVisible);
    this.title = wrap(function(title) {cobj.test.assertTitle(title);});
    this.hasText = wrap(function(selector, msg) {
        cobj.test.assert(!!cobj.fetchText(selector).trim(), msg);
    });
    this.text = wrap(function(selector, text, msg) {
        cobj.test.assertEquals(cobj.fetchText(selector).trim(), text, msg);
    });
    this.textIsnt = wrap(function(selector, text, msg) {
        cobj.test.assertNotEquals(cobj.fetchText(selector).trim(), text, msg);
    });
    this.URL = wrap(function(url) {cobj.test.assertUrlMatch(url);});
    this.selectorExists = wrap(cobj.test.assertExists);
    this.selectorDoesNotExist = wrap(cobj.test.assertDoesntExist);
    this.validText = function(selector, textShouldntBe) {
        this.hasText(selector);
        this.textIsnt(textShouldntBe);
    };
}

function Suite(options) {
    var _this = this;
    var asserts = 0;

    var cobj = casper;
    // options = options || {};
    // options.verbose = true;
    // options.logLevel = 'debug';
    // var cobj = require('casper').create(options);

    cobj.on('page.error', function(err, trace) {
        console.error(err);
        trace.forEach(function(item) {
            console.log('  ', item.file, ':', item.line);
        });
    });

    this.run = function(url, callback) {

        if (_this.casperSkip) {
            console.log('Skipping...');
            cobj.test.done();
            return;
        }

        if (url[0] === '/') {
            url = url.substr(1);
        }
        url = base_url + url;
        var started = false;
        var next_runner = function(callback) {
            cobj.start.apply(cobj, [url, callback]);
            if (_this.setUp) {
                console.log('Running setUp');
                _this.setUp();
            }
            next_runner = function() {
                cobj.then.apply(cobj, arguments);
            };
            started = true;
        };

        console.log('Queueing test case.');
        callback(function(name, callback) {
            next_runner(function(response) {
                console.log('RUNNING :: ' + name);
                var asserter = new assert(this);
                callback(asserter, response);
                asserts += asserter.asserts;
            });
        }, function(waiter, callback) {
            // If we're waiting for something and the tests haven't started,
            // start the tests with a noop callback.
            if (!started) {
                next_runner(function() {
                    console.log('Initial navigation initiated.');
                });
            }
            // Tell casper to wait until `waiter` evaluates to a truthy return
            // value.
            cobj.waitFor(
                waiter,
                callback || function() {console.log('Wait condition met.');},
                function() {
                    var path_safe = url.replace(/\//g, '_');
                    cobj.capture(
                        'captures/errors/timeout_' +
                        path_safe + '_' +
                        ((new Date()).getTime() / 1000 | 0) + '.png');
                    throw new Error('waitFor timeout :(');
                },
                5000
            );
        });

        console.log('Running tests...');
        cobj.run(function() {
            if (_this.tearDown) {
                console.log('Running tearDown');
                _this.tearDown();
            }
            this.test.done(asserts);
        });
    };

    this.back = function() {
        return cobj.back();
    };

    this.capture = function(filename) {
        cobj.capture('captures/' + filename);
    };

    this.evaluate = function() {
        return cobj.evaluate.apply(cobj, arguments);
    };

    this.fill = function(form_selector, data, submit) {
        console.log('Filling ', form_selector);
        cobj.fill(form_selector, data);
        if (submit) {
            console.log('Submitting ', form_selector);
            cobj.evaluate(function(selector) {
                var e = document.createEvent('HTMLEvents');
                e.initEvent('submit', true, true);
                document.querySelector(selector).dispatchEvent(e);
            }, form_selector);
        }
    };

    this.press = function(selector) {
        console.log('Clicking ' + selector);
        cobj.click(selector);
    };

    this.exists = function(selector) {
        return cobj.exists(selector);
    };

    this.getElementBounds = function(selector) {
        return cobj.getElementBounds(selector);
    };

    this.visible = function(selector) {
        return cobj.visible(selector);
    };

    this.getFormValues = function(selector) {
        return cobj.getFormValues(selector);
    };

    this.getText = function(selector) {
        return cobj.fetchText(selector);
    };

    this.viewport = function(w, h) {
        console.log('Setting viewport to ' + w + 'x' + h);
        return cobj.viewport(w, h);
    };

}

exports.suite = function(options) {
    return new Suite(options);
};
