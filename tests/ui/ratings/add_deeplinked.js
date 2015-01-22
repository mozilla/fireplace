var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/app/foo/ratings/add'});

casper.test.begin('Check redirection to app page', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertUrlMatch(/\/app\/foo$/);
        });

        casper.run(function() {
           test.done();
        });
    }
});
