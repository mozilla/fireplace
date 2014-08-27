var helpers = require('../helpers');
var scrollPos;

helpers.startCasper();

casper.test.begin('Test navbar', {

    test: function(test) {

        casper.waitForSelector('.navbar', function() {
            test.assertExists('.nav-mkt[data-tab="homepage"].active', 'Check navbar initialised');
            test.assertExists('.nav-mkt li[data-tab="homepage"].active', 'Check navbar li initialised');
            test.assertExists('.nav-settings[data-tab="settings"]:not(.active)', 'Check settings exists but is not active.');
            test.assertExists('.nav-settings li[data-tab="settings"].active', 'Check settings li exists');
            casper.click('.nav-mkt li[data-tab="categories"] a');
        });

        casper.waitForSelector('.nav-mkt li[data-tab="categories"].active', function() {
            test.assertExists('.nav-mkt[data-tab="categories"]', 'Check category tab active');
            casper.click('.act-tray.mobile');
        });

        casper.waitForSelector('#account-settings', function() {
            test.assertExists('.nav-settings.active', 'Check settings navbar shown');
            casper.click('.nav-settings li[data-tab="feedback"] a');
        });

        casper.waitForSelector('.feedback.main', function() {
            test.assertExists('.nav-settings[data-tab="feedback"]', 'Check feeback tab clicked');
            casper.click('.mkt-tray');
        });

        casper.waitForSelector('.nav-mkt', function() {
            test.assertExists('.nav-mkt[data-tab="categories"]', 'Check we are back on cats tab');
            test.assertExists('.nav-mkt li[data-tab="categories"].active', 'Check cat li has active class.');
        });

        casper.run(function() {
            test.done();
        });
    }
});
