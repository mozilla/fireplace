var helpers = require('../lib/helpers');


function restoreOnlineState() {
    casper.echo('Changing window.__mockOffLine -> false', 'INFO');
    casper.evaluate(function() {
        window.__mockOffLine = false;
    });
}

function restoreDate() {
    casper.echo('Restoring window.Date', 'INFO');
    casper.evaluate(function() {
        window.Date = window.__OldDate;
    });
}

casper.test.begin('Check offline dialogue', {
    setUp: function() {
        casper.once('page.initialized', function() {
            casper.echo('Setting window.__mockOffLine -> true', 'INFO');
            casper.evaluate(function() {
                window.__mockOffLine = true;
            });
        });
    },
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            test.assertVisible('#error-overlay.offline',
                               'Check offline error message is shown');
        });

        casper.then(function() {
            restoreOnlineState();
            casper.click('.try-again');
        });

        casper.waitForSelector('#splash-overlay:not(.hide)', function() {
            // Wait for the splash to show up again before continuing.
        });

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertNotVisible('#error-overlay.offline',
                                  'Check offline error message is removed');
        });

        helpers.done(test);
    },
    tearDown: restoreOnlineState
});


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
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            test.assertVisible('.system-date',
                               'Check date error message is shown');
            restoreDate();
            casper.click('.try-again');
        });

        casper.waitWhileSelector('#error-overlay.system-date');

        helpers.waitForPageLoadedAgain(function() {
            test.assertNotVisible('#error-overlay');
        });

        helpers.done(test);
    },
    tearDown: restoreDate
});
