var helpers = require('../helpers');

helpers.startCasper({path: '/tests'});

casper.test.begin('Basic test', {

    test: function(test) {

        casper.waitForSelector('progress[value="1"]', function() {
            var startedCount = casper.fetchText('#c_started');
            var passedCount = casper.fetchText('#c_passed');
            test.assertEquals(casper.fetchText('#c_failed'), '0', 'Assert no failures');
            test.assertEquals(startedCount, passedCount, 'Assert all tests ended');
            if (startedCount != passedCount) {
                helpers.capture('unittest-failures.png');
            }
        });

        casper.run(function() {
            test.done();
        });
    },
});
