var helpers = require('../../helpers');

helpers.startCasper({path: '/app/user'});

casper.test.begin('Detail page tests for apps as an end user', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertUrlMatch(/\/app\/user/);
            test.assertNotVisible('.expand-toggle');
            helpers.assertContainsText('h3');
            test.assertSelectorDoesntHaveText('.mkt-tile h3', 'Loading...');
            test.assertDoesntExist('.button.manage');  // "Edit Listing" button
            test.assertDoesntExist('.button.reviewer');  // "Approve/Reject" / "Review History" button
        });

        casper.run(function() {
           test.done();
        });
    }
});
