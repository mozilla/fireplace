var helpers = require('../helpers');

helpers.startCasper({path: '/tests'});

casper.test.begin('Unit tests', {
    test: function(test) {
        casper.waitForSelector('progress[value="1"]', function() {
            var startedCount = casper.fetchText('#c_started');
            var passedCount = casper.fetchText('#c_passed');
            test.assertEquals(casper.fetchText('#c_failed'), '0', 'Assert no failures');
            test.assertEquals(startedCount, passedCount, 'Assert all tests ended');
            if (startedCount != passedCount) {
                helpers.capture('unittest-failures.png');
            }
        }, function() {
            test.assert(false, 'Test timeout');
        }, 10000);

        casper.run(function() {
            test.done();
        });
    },

    tearDown: function testStatus() {
        casper.echo('Getting test results...');

        function logError(type, msg) {
            console.log(casper.test.colorize(type, 'WARNING') + ' ' + msg);
        }

        var testResults = casper.evaluate(function() {
            var testElements = document.querySelector('ol.tests').children;
            return Array.prototype.map.call(testElements, function(test) {
                return {
                    // If an error message is provided it is included in the span.
                    status: test.getAttribute('status'),
                    name: test.getAttribute('name'),
                };
            });
        });

        var testCount = testResults.length;
        var passCount = 0;
        var failCount = 0;
        var stallCount = 0;
        var initCount = 0;

        testResults.forEach(function(testResult) {
            if (testResult.status === 'fail') {
                failCount++;
                logError('FAIL', testResult.name);
            } else if (testResult.status === 'stall') {
                stallCount++;
                logError('STALL', testResult.name);
            } else if (testResult.status === 'init') {
                initCount++;
                logError('INIT', testResult.name);
            } else {
                passCount++;
            }
        });

        var status, color;
        if (passCount === testCount) {
            status = 'PASS';
            color = 'GREEN_BAR';
        } else {
            status = 'FAIL';
            color = 'RED_BAR';
        }
        console.log(casper.test.colorize(status, color) + ' ' + [
            testCount + ' started',
            passCount + ' passed',
            failCount + ' failed',
            stallCount + ' stalled',
            initCount + ' errored'
        ].join(', ') + '.');
    },
});
