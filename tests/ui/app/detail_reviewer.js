var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/app/developed'});

casper.test.begin('Detail page tests for apps as a reviewer with Apps:Edit (developer) permissions', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            casper.evaluate(function() {
                console.log('[phantom] Giving user "reviewer" permissions');
                window.require('user').update_permissions({reviewer: true});
                require('views').reload();
            });

            test.assertUrlMatch(/\/app\/developed/);
            test.assertNotVisible('.expand-toggle');
            helpers.assertContainsText('h3');
            test.assertSelectorDoesntHaveText('.mkt-tile h3', 'Loading...');
            test.assertExists('.button.manage');  // "Edit Listing" button
            test.assertExists('.button.reviewer');  // "Approve/Reject" / "Review History" button
        });

        casper.run(function() {
           test.done();
        });
    }
});
