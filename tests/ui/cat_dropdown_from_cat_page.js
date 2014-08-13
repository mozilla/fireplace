var helpers = require('../helpers');

helpers.startCasper({path: '/category/shopping'});

casper.test.begin('Test Category Drop down from category page', {

    test: function(test) {

        casper.waitFor(function() {
            return casper.fetchText('.dropdown a') === 'Shopping';
        }, function() {
            casper.click('.dropdown a');
        });

        casper.waitForSelector('.cat-menu', function() {
            test.assertExists('.cat-menu .cat-shopping.current');
            casper.click('.cat-menu .cat-social');
        });

        casper.waitForUrl(/\/category\/social/, function() {
            test.assertSelectorHasText('.dropdown a', 'Social');
            test.assertExists('.cat-menu .cat-social.current');
            test.assertExists('.dropdown a');
            casper.click('.dropdown a');
        });

        casper.waitForSelector('.cat-menu', function() {
            casper.click('.cat-menu .cat-all');
        });

        casper.waitForSelector('.dropdown a', function() {
            test.assertSelectorHasText('.dropdown a', 'All Categories');
            test.assertExists('.cat-menu .cat-all.current');
            test.assertDoesntExist('.cat-menu .current:not(.cat-all)');
        });

        casper.run(function() {
            test.done();
        });
    }
});
