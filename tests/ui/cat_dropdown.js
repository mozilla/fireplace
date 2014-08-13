var helpers = require('../helpers');

helpers.startCasper();

casper.test.begin('Test Category Drop down', {

    test: function(test) {

        casper.waitForSelector('.dropdown a', function() {
            test.assertSelectorHasText('.dropdown a', 'All Categories');
            casper.click('.dropdown a');
        });

        casper.waitForSelector('.cat-menu', function() {
            casper.click('.cat-menu .cat-games');
        });

        casper.waitForSelector('#gallery', function() {
            test.assertUrlMatch(/\/category\/[a-zA-Z0-9]+/);
            test.assertExists('.cat-menu .cat-games.current');
            test.assertExists('.dropdown a');
            casper.click('.dropdown a');
        });

        casper.waitForSelector('.cat-menu', function() {
            casper.click('.cat-menu .cat-all');
        });

        casper.waitForSelector('.dropdown a', function() {
            test.assertSelectorHasText('.dropdown a', 'All Categories');
            test.assertExists('.cat-menu .cat-all.current');
            test.assertDoesntExist('.cat-menu .cat-games.current');
        });

        casper.run(function() {
            test.done();
        });
    }
});
