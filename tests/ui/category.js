var helpers = require('../helpers');

helpers.startCasper({path: '/category/games'});

casper.test.begin('Category baseline tests', {

    test: function(test) {

        casper.waitForSelector('#gallery li a', function() {
            test.assertUrlMatch(/\/category\/[a-zA-Z0-9]+/);
            test.assertVisible('#search-q');
            test.assertExists('#gallery');
            test.assertVisible('#gallery');
            test.assertVisible('#gallery ol.listing li a.mkt-tile');
            casper.click('#gallery ol.listing li a.mkt-tile:first-child');
            test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
        });

        casper.run(function() {
            test.done();
        });
    }
});
