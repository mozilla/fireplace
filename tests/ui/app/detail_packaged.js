var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/app/packaged'});

casper.test.begin('Test packaged apps display properly', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertUrlMatch(/\/app\/packaged/);
            test.assertExists('.blurbs .package-version');
            test.assertSelectorHasText('.blurbs .package-version', 'Latest version: 1.0');
        });

        casper.run(function() {
           test.done();
        });
    }
});
