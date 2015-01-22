var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/app/developed'});

casper.test.begin('Detail page tests for apps as a developer', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            helpers.fake_login();
            test.assertUrlMatch(/\/app\/developed/);
            test.assertNotVisible('.expand-toggle');
            helpers.assertContainsText('h3');
            test.assertSelectorDoesntHaveText('.mkt-tile h3', 'Loading...');
            test.assertExists('.button.manage');  // "Edit Listing" button
            test.assertDoesntExist('.button.reviewer');  // "Approve/Reject" / "Review History" button
        });

        casper.run(function() {
           test.done();
        });
    }
});
