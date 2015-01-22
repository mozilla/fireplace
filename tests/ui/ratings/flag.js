var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/app/can_rate'});

casper.test.begin('Test flag rating', {

    test: function(test) {

        casper.waitForSelector('.reviews ul, .reviews p.not-rated', function() {
            casper.click('.reviews .average-rating');
        });

        casper.waitForSelector('.reviews-listing', function() {
            casper.click('.reviews-listing .actions .flag');
        });

        casper.waitForUrl(/\/app\/can_rate\/ratings/, function() {
            helpers.assertContainsText('#write-review');
            test.assertVisible('.report-spam');
            test.assertExists('.report-spam ul li a');
        });

        casper.run(function() {
           test.done();
        });
    }
});
