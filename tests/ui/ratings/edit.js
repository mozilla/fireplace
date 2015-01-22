var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/app/has_rated'});

casper.test.begin('Edit rating tests', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
           test.assertSelectorHasText('#add-review', 'Sign in to Review');
           casper.click('.write-review');
           helpers.fake_login();
        });

        casper.waitForSelector('.compose-review', function() {
            test.assertUrlMatch(/\/app\/has_rated\/ratings\/edit/);
        });

        casper.run(function() {
           test.done();
        });
    }
});
