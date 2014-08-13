var helpers = require('../../helpers');

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
            casper.click('.ratingwidget label:last-child');
            casper.fill('.add-review-form', {body: 'this is a test'});
            test.assertExists('.add-review-form button:not([disabled])');
            casper.click('.add-review-form button');
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
