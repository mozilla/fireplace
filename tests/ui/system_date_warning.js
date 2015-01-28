var helpers = require('../lib/helpers');

helpers.startCasper();


function restoreDate() {
    casper.echo('Restoring window.Date', 'INFO');
    casper.evaluate(function() {
        window.Date = window.__OldDate;
    });
}


casper.test.begin('Check date check dialogue', {

    setUp: function() {
        casper.once('page.initialized', function() {
            casper.echo('Overriding window.Date', 'INFO');
            casper.evaluate(function() {
                // Backdate `Date` for testing.
                window.__OldDate = window.Date;
                var d = new Date(2000, 1, 1);
                window.Date = function() {
                    return d;
                };
                // For `Date.now` (and `jquery.now`) to work.
                window.Date.now = function() {
                    return d.getTime();
                };
            });
        });
    },

    tearDown: function() {
        restoreDate();
    },

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertVisible('#error-overlay.system-date', 'Check date error message is shown');
        });

        casper.then(function() {
            restoreDate();
            casper.click('.try-again');
        });

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertNotVisible('#error-overlay.system-date', 'Check date error message is removed');
        });

        casper.run(function() {
            test.done();
        });
    },
});
