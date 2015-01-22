var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/app/can_rate'});

casper.test.begin('Add rating on desktop', {

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
            casper.click('.write-review');
            helpers.fake_login();
        });

        casper.waitForSelector('#add-review', function() {
            test.assertVisible('.compose-review.modal');
            casper.click('.add-review-form .cancel');
        });

        casper.waitWhileVisible('.compose-review.modal', function() {
            test.assertNotVisible('.compose-review.modal');
            test.assertDoesntExist('.cloak.show');
        });

        casper.run(function() {
           test.done();
        });
    }
});
