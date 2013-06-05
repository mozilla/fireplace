define('assert', ['underscore'], function(_) {

    function assert(x, msg) {
        if (!x) {
            throw new Error(msg || 'Assertion failed');
        }
    }

    function ok_() {
        // <3 andym
        assert.apply(this, arguments);
    }

    function eq_(x, y, msg) {
        try {
            assert(x == y);
        } catch (e) {
            throw new Error(msg || ('"' + x + '" did not match "' + y + '"'));
        }
    }

    function eeq_(x, y, msg) {
        try {
            assert(x === y);
        } catch (e) {
            throw new Error(msg || ('"' + x + '" did not exactly match "' + y + '"'));
        }
    }

    // Fuzzy equals
    function feq_(x, y, msg) {
        try {
            assert(_.isEqual(x, y));
        } catch (e) {
            if (msg) {
                throw new Error(msg);
            } else {
                throw new Error(JSON.stringify(x) + ' did not match ' + JSON.stringify(y));
            }
        }
    }

    function _contain(haystack, needle) {
        if (_.isObject(haystack)) {
            return needle in haystack;
        } else if (_.isString(haystack)) {
            return haystack.indexOf(needle) !== -1;
        } else {
            return _.contains(haystack, needle);
        }
    }

    function contains(haystack, needle, msg) {
        msg = msg || (JSON.stringify(haystack) + ' does not contain ' + JSON.stringify(needle));
        assert(_contain(haystack, needle), msg);
    }

    function disincludes(haystack, needle, msg) {
        msg = msg || (JSON.stringify(haystack) + ' contains ' + JSON.stringify(needle));
        assert(!_contain(haystack, needle), msg);
    }

    /*
    How to mock:

    mock(
        'foomodule',  // The module you're testing
        {  // Modules being mocked
            utils: function() {
                return { ... };
            },
            capabilities: {
                widescreen: function() { return false; }
            }
        },
        function(foomodule) {  // We import the module for you.
            // Run your tests as usual.
            test('foomodule', function(done) {
                foomodule.should_not_explode();
                done();
            });
        }
    );
    */
    function mock(test_module, mock_objs, runner, failfunc) {
        var stub_map = {};
        var stubbed = _.object(_.pairs(mock_objs).map(function(x) {
            var orig = x[0];
            x[0] += _.uniqueId('_');
            stub_map[orig] = x[0];

            // Function-ify non-functions.
            if (_.isFunction(x[1])) {
                x[1] = x[1]();
            } else if (_.isArray(x[1])) {
                // If it's an array, convert it to an array-like object.
                // Require.js freaks out when you give it an array, but this
                // should work in (almost) all circumstances.
                x[1] = _.extend({}, x[1])
            }

            return x;
        }));

        var context = require.config({
            context: _.uniqueId(),
            map: {'*': stub_map},
            baseUrl: 'media/js/',
            paths: requirejs.s.contexts._.config.paths,
            shim: requirejs.s.contexts._.config.shim
        });

        _.each(stubbed, function(v, k) {
            define(k, v);
        });

        context([test_module], function(module) {
            try {
                runner.apply(this, [module, mock_objs]);
            } catch (e) {
                if (failfunc) {
                    failfunc(e);
                }
            }
        });
    }

    return {
        assert: assert,
        ok_: ok_,
        eq_: eq_,
        eeq_: eeq_,
        feq_: feq_,
        contains: contains,
        disincludes: disincludes,
        mock: mock
    };
});
