var helpers = require('../helpers');

helpers.startCasper();

casper.test.begin('Homepage baseline tests', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertTitle('Firefox Marketplace');
            test.assertVisible('.wordmark');
            test.assertVisible('.header-button.settings');  // Persona not visible at mobile width :O
            test.assertVisible('#search-q');
            test.assertNotVisible('.expand-toggle');
            test.assertDoesntExist('.mkt-tile .tray');
        });

        casper.run(function() {
            test.done();
        });
    }
});
