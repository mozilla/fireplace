var helpers = require('../../helpers');

helpers.startCasper({path: '/app/has_rated'});

casper.test.begin('Detail can rate', {

    setUp: function() {
        casper.echo('Setting up', 'INFO');
        casper.viewport(1024, 768);
    },

    tearDown: function() {
        casper.echo('Tearing down', 'INFO');
        casper.viewport(400, 300);
    },

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertSelectorHasText('#add-review', 'Sign in to Review');
            // Trigger a fake Persona login
            helpers.fake_login();
        });

        casper.waitForSelector('#edit-review', function() {
            test.assertSelectorHasText('#edit-review', 'Edit Your Review');
            casper.click('.logout');
        });

        casper.waitForSelector('#add-review', function() {
            test.assertSelectorHasText('#add-review', 'Sign in to Review');
        });

        casper.run(function() {
           test.done();
        });
    }
});
