var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/app/can_rate'});

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

        casper.waitForSelector('.reviews', function() {
            test.assertSelectorHasText('#add-review', 'Sign in to Review');
            helpers.fake_login();
        });

        casper.waitForSelector('#add-review', function() {
            test.assertSelectorHasText('#add-review', 'Write a Review');
            casper.click('.logout');
        });

        casper.waitForText('Sign in to Review', function() {
            test.assertSelectorHasText('#add-review', 'Sign in to Review');
        });

        casper.run(function() {
           test.done();
        });
    }
});
