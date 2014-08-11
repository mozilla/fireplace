var helpers = require('../helpers');

helpers.startCasper({path: '/category/shopping'});

casper.test.begin('Test Category from featured listing', {

    test: function(test) {

        casper.waitForSelector('#featured li a', function() {
            test.assertUrlMatch(/\/category\/[a-zA-Z0-9]+/);
            casper.click('#gallery .view-all');
        });

        casper.waitForSelector('ol.listing', function() {
            // Only category listing pages have the #featured container.
            test.assertDoesntExist('#gallery');
            test.assertVisible('#search-results');
            test.assertVisible('#search-results ol.listing li a.mkt-tile');
            casper.click('#search-results ol.listing li a.mkt-tile:first-child');
            test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
        });

        casper.run(function() {
            test.done();
        });
    }
});
