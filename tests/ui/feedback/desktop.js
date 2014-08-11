var helpers = require('../../helpers');

helpers.startCasper();

casper.test.begin('Feedback on desktop', {

    setUp: function() {
        casper.echo('Setting up', 'INFO');
        casper.viewport(720, 500);
    },

    tearDown: function() {
        casper.echo('Tearing down', 'INFO');
        casper.viewport(400, 300);
    },

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            casper.click('#site-footer .submit-feedback');
        });

        casper.waitForSelector('.feedback.modal', function() {
            test.assertVisible('.feedback.modal');
            test.assertVisible('.feedback-form textarea');
            test.assertExists('.potato-captcha');
            test.assertNotVisible('.potato-captcha');
            test.assertExists('.feedback-form button[disabled]');
            test.assertElementCount('.feedback.modal', 1, 'Only one feedback modal exists');
            casper.fill('.feedback-form', {'feedback': 'test'});
            test.assertExists('.feedback-form button:not([disabled])');
            casper.click('.feedback-form button');
         });

        casper.waitWhileVisible('.feedback.modal', function() {
            test.assertNotVisible('.feedback.modal');
        });

        casper.run(function() {
           test.done();
        });
    }
});
