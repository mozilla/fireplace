/*
    Tests for the feedback form on both desktop and mobile.
    In some cases the form is a modal, in others it is a page.
    TODO: add more tests once we get Phantom to recognize our custom elements.
*/
var helpers = require('../lib/helpers');

casper.test.begin('Feedback modal on desktop', {
    test: function(test) {
        helpers.startCasper();
        helpers.changeViewportDesktop();

        helpers.waitForPageLoaded(function() {
            casper.click('.submit-feedback');
        });

        casper.waitForSelector('[data-modal="feedback"]', function() {
            test.assertElementCount('[data-modal="feedback"]', 1,
                                    'Only one feedback modal exists');

            test.assertVisible('textarea[name="feedback"]');

            test.assertExists('.potato-captcha');
            test.assertNotVisible('.potato-captcha');

            casper.fill('.feedback-form', {'feedback': 'test'});
         });

         helpers.done(test);
    }
});


casper.test.begin('Feedback page on desktop', {
    test: function(test) {
        helpers.startCasper({path: '/feedback'});
        helpers.changeViewportDesktop();

        helpers.waitForPageLoaded(function() {
            test.assertVisible('mkt-prompt:not([data-modal])');
            casper.click('.submit-feedback');
            helpers.assertHasFocus('.feedback-form textarea');
        });

        helpers.done(test);
    }
});


casper.test.begin('Feedback page on mobile', {
    test: function(test) {
        helpers.startCasper({path: '/feedback'});

        casper.waitUntilVisible('.feedback-form', function() {
            test.assertExists('.potato-captcha');
            test.assertNotVisible('.potato-captcha');

            casper.fill('.feedback-form', {'feedback': 'test'});
        });

        helpers.done(test);
    }
});
