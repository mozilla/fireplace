var helpers = require('../lib/helpers');

helpers.startCasper();

casper.test.begin('Search empty', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            casper.fill('#search', {q: 'empty'}, true);
        });

        casper.waitWhileVisible('.placeholder .spinner', function() {
            test.assertUrlMatch(/\/search\?q=empty/);
            test.assertVisible('#search-q');
            test.assertDoesntExist('#featured');
            test.assertDoesntExist('.search-listing');
            test.assertSelectorHasText('p.no-results', 'No results found');
        });

        casper.run(function() {
            test.done();
        });
    }
});
