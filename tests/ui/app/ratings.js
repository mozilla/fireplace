var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/app/can_rate'});

casper.test.begin('Ratings page baseline tests', {

    test: function(test) {

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

        casper.run(function() {
           test.done();
        });
    }
});
