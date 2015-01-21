var helpers = require('../helpers');

helpers.startCasper({path: '/category/games'});

casper.test.begin('Category baseline tests', {

    test: function(test) {
        casper.waitForSelector('.app-list', function() {
            test.assertUrlMatch(/\/category\/[a-zA-Z0-9]+/);
            test.assertVisible('#search-q');
            test.assertVisible('.app-list');
            test.assertVisible('.app-list .app-list-app');
            casper.click('.app-list .mkt-tile');
            test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
        });

        casper.run(function() {
            test.done();
        });
    }
});
