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
            test.assertVisible('.add-review-form');
            test.assertVisible('.char-count b');
            test.assertSelectorHasText('.char-count b', '150');
            casper.fill('.add-review-form', {'body': 'test'});
        });

        casper.waitForText('146', function() {
            test.assertSelectorHasText('.char-count b', '146');
            test.assertExists('.add-review-form button[type="submit"][disabled]');
            casper.click('.stars input[value="3"]');
            test.assertExists('.add-review-form button[type="submit"]:not([disabled])');
        });

        casper.run(function() {
           test.done();
        });
    }
});
