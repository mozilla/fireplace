
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
            func.apply(this, arguments);
            me.asserts++;
        };
    }
    this.that = wrap(cobj.test.assert);
    this.visible = wrap(function(selector) {
        cobj.test.assert(cobj.visible(selector), selector + ' is visible');
    });
    this.title = wrap(function(title) {cobj.test.assertTitle(title);});
    this.URL = wrap(function(url) {cobj.test.assertUrlMatch(url);});
    this.selectorExists = wrap(function(selector) {cobj.test.assertExists(selector);});
}

function Suite(options) {
    var _this = this;
    var asserts = 0;

    options = options || {};
    options.verbose = true;
    options.logLevel = 'warning';
    var cobj = require('casper').create(options);

    var then_queue = [];

    function testgen(name, callback) {
        then_queue.push(function() {
            var asserter = new assert(this);
            console.log('RUNNING:: ' + name);
            callback(asserter);
            asserts += asserter.asserts;
        });
    }

    function wrap_casper(callback) {
        // Give a tiny pause for async setup
        return function() {
            var args = arguments;
            cobj.wait(100, function() {
                callback.apply(this, args);
            });
        };
    }

    var waiter;

    this.run = function(url, callback) {
        if (url[0] === '/') {
            url = url.substr(1);
        }
        console.log('Planning test case.');
        callback(testgen, function(test) {
            waiter = test;
        });
        console.log('Tests planned, queueing tests.');

        if (waiter) {
            cobj.start(base_url + url);
            console.log('Waiting for condition before tests...');
            cobj.waitFor(
                waiter,
                wrap_casper(then_queue.shift()),
                function() {
                    console.error('waitFor timeout :(');
                }
            );
        } else {
            cobj.start(base_url + url, wrap_casper(then_queue.shift()));
        }

        while (then_queue.length) {
            console.log('Queueing next test step...');
            casper.then(wrap_casper(then_queue.shift()));
        }
        console.log('Running tests...')
        cobj.run(function() {
            this.test.done(asserts);
            this.test.renderResults(true);
        });
    };

    this.capture = function(filename) {
        cobj.capture('captures/' + filename, {
            top: 0,
            left: 0,
            width: 1024,
            height: 768
        });
    };

    this.fill = function(form_selector, data) {
        console.log('Filling ' + form_selector);
        cobj.fill(selector, data);
    };

    this.press = function(selector) {
        console.log('Clicking ' + selector);
        cobj.click(selector);
    };

    this.exists = function(selector) {
        return cobj.exists(selector);
    }

    this.visible = function(selector) {
        return cobj.visible(selector);
    }

}

exports.suite = function(options) {
    return new Suite(options);
};
