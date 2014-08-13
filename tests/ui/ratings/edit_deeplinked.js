var helpers = require('../../helpers');

helpers.startCasper({path: '/app/foo/ratings/edit'});

casper.test.begin('Edit ratings deeplink redirection', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertUrlMatch(/\/app\/foo$/);
        });

        casper.run(function() {
           test.done();
        });
    }
});
