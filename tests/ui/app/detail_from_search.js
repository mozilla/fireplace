var helpers = require('../../helpers');

helpers.startCasper({path: '/search?q=test'});

casper.test.begin('Test detail page from search.', {

    test: function(test) {

        casper.waitForSelector('#search-results li a:first-child', function() {
            test.assertNotVisible('.dropdown', 'Ensure no cat dropdown on search page');
            casper.click('#search-results li a:first-child');
            test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/, "Test that we're on a detail page");
        });

        casper.run(function() {
           test.done();
        });
    }
});
