var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/app/can_rate'});

casper.test.begin('Add rating tests', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertSelectorHasText('#add-review', 'Sign in to Review');
            casper.click('.write-review');
            helpers.fake_login();
        });

        casper.waitForSelector('.compose-review', function() {
            test.assertUrlMatch(/\/app\/can_rate\/ratings\/add/);
            test.assertVisible('.compose-review');
            test.assertVisible('.add-review-form');
            casper.click('.add-review-form .cancel');
        });

        // On mobile, canceling the add review form takes you back to the
        // detail page.
        casper.waitForUrl(/\/app\/can_rate/, function() {
            test.assertUrlMatch(/\/app\/can_rate/);
            test.assertNotVisible('.compose-review');
            test.assertDoesntExist('.cloak.show');
        });

        casper.run(function() {
           test.done();
        });
    }
});
