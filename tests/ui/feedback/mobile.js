var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/settings'});

casper.test.begin('Feedback tests on mobile', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            casper.click('.nav-settings .feedback a');
        });

        casper.waitUntilVisible('.feedback-form textarea', function() {
            test.assertExists('.potato-captcha');
            test.assertNotVisible('.potato-captcha');
            test.assertExists('.feedback-form button[disabled]');
            casper.fill('.feedback-form', {'feedback': 'test'});
            test.assertExists('.feedback-form button:not([disabled])', 'Check button enabled');
        });

        casper.run(function() {
           test.done();
        });
    }
});
