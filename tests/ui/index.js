var helpers = require('../lib/helpers');

helpers.startCasper();

casper.test.begin('"Home" page tests', {
    test: function(test) {
        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertTitle('Firefox Marketplace');
            test.assertVisible('.wordmark');
            test.assertVisible('.header-button.settings');
            test.assertVisible('#search-q');
            test.assertVisible('.home-feed');
            test.assertDoesntExist('.mkt-tile .tray');
            test.assertNotVisible('.app-list-filters-expand-toggle');
        });

        casper.run(function() {
            test.done();
        });
    }
});
