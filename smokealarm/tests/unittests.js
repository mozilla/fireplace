var suite = require('./kasperle').suite();

suite.run('/tests', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('progress[value="1"]');
    });

    test('Unit tests', function(assert) {
        var startedCount = suite.getText('#c_started');
        var passedCount = suite.getText('#c_passed');
        assert.equal(suite.getText('#c_failed'), '0', 'Assert no failures');
        assert.equal(startedCount, passedCount, 'Assert all tests ended');
        if (startedCount != passedCount) {
            suite.capture('unittest-failures.png');
        }
    });
});
