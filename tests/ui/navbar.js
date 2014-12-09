var helpers = require('../helpers');
var scrollPos;

helpers.startCasper();

casper.test.begin('Test navbar', {

    test: function(test) {

        casper.waitForSelector('.navbar', function() {
            test.assertExists('.nav-mkt.active', 'Check navbar initialised');
            test.assertExists('.nav-mkt li[data-tab="homepage"]', 'Check navbar li initialised');
            test.assertExists('.nav-settings:not(.active)', 'Check settings exists but is not active.');
            test.assertExists('.nav-settings li[data-tab="settings"]', 'Check settings li exists');
            casper.click('.nav-mkt li[data-tab="categories"] a');
        });

        casper.waitForSelector('[data-page-type~="categories"]', function() {
            test.assertExists('[data-page-type~=categories]', 'Check navigate to category');
            casper.click('.nav-mkt li[data-tab="recommended"] a');
        });

        // Recommended exists but may or may not be visible depending on login state.
        casper.waitForSelector('[data-page-type~="recommended"]', function() {
            test.assertExists('[data-page-type~=recommended]', 'Check navigate to recommended');
            casper.click('.act-tray-mobile');
        });

        casper.waitForSelector('#account-settings', function() {
            test.assertExists('.nav-settings.active', 'Check settings navbar shown');
            casper.click('.nav-settings li[data-tab="feedback"] a');
        });

        casper.waitForSelector('.feedback.main', function() {
            test.assertExists('.feedback.main', 'Check navigate to feedback');
            casper.click('.mkt-tray');
        });

        casper.waitForSelector('.nav-mkt.active', function() {
            test.assertExists('[data-page-type~=homepage]',
                              'Check we are back on homepage');
            test.assertExists('.nav-mkt.active',
                              'Check nav-mkt has active class.');
        });

        casper.run(function() {
            test.done();
        });
    }
});
