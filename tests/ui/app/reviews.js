/*
    Tests for an app's review page.
*/
var helpers = require('../../lib/helpers');

casper.test.begin('App reviews tests', {
    test: function(test) {
        helpers.startCasper({path: '/app/can_rate'});

        casper.waitForSelector('.reviews h3', function() {
            casper.click('.reviews .average-rating');
        });

        casper.waitForSelector('.main #add-review.primary-button', function() {
            casper.click('.reviews .actions .flag');
        });

        casper.waitForUrl(/\/app\/can_rate\/ratings/, function() {
            helpers.assertContainsText('#write-review');
            test.assertVisible('.report-spam.show');
            test.assertExists('.report-spam.show ul li a');
        });

        helpers.done(test);
    }
});
