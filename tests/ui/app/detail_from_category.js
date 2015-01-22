var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/category/games'});

casper.test.begin('Test detail page from category.', {

    test: function(test) {

        casper.waitForSelector('#gallery li a:first-child', function() {
            casper.click('#gallery li a:first-child');
            test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/, "Test that we're on a detail page");
        });

        casper.run(function() {
           test.done();
        });
    }
});
