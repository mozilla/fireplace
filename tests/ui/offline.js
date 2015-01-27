var helpers = require('../lib/helpers');

helpers.startCasper();


function restoreOnlineState() {
    casper.echo('Changing window.__mockOffLine -> false', 'INFO');
    casper.evaluate(function() {
        window.__mockOffLine = false;
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

    tearDown: function() {
        restoreOnlineState();
    },

    test: function(test) {
        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertVisible('#error-overlay.offline', 'Check offline error message is shown');
        });

        casper.then(function() {
            restoreOnlineState();
            casper.click('.try-again');
        });

        casper.waitForSelector('#splash-overlay:not(.hide)', function() {
            // Wait for the splash to show up again before continuing.
        });

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertNotVisible('#error-overlay.offline', 'Check offline error message is removed');
        });

        casper.run(function() {
            test.done();
        });
    },
});
