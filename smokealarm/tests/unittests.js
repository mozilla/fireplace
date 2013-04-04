var suite = require('./kasperle').suite();

suite.run('/tests', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('progress[value="1"]');
    });

    test('Unit tests', function(assert) {
        assert.equal(suite.getText('#c_failed'), '0',
                     'Assert no failures');
        assert.equal(suite.getText('#c_started'),
                     suite.getText('#c_passed'),
                     'Assert all tests ended');
    });
});
