define(['underscore'], function(_) {

    function assert(x) {
        if (!x) {
            throw new Error('Assertion failed');
        }
    }

    function ok_() {
        // <3 andym
        assert.apply(this, arguments);
    }

    function eq_(x, y) {
        try {
            assert(x == y);
        } catch(e) {
            throw new Error('"' + x + '" did not match "' + y + '"');
        }
    }

    // Fuzzy equals
    function feq_(x, y) {
        try {
            assert(_.isEqual(x, y));
        } catch(e) {
            throw new Error(JSON.stringify(x) + ' did not match ' + JSON.stringify(y));
        }
    }

    return {
        assert: assert,
        ok_: ok_,
        eq_: eq_,
        feq_: feq_
    }
});
