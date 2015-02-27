/*
    Tests for the feedback form on both desktop and mobile.
    In some cases the form is a modal, in others it is a page.
    TODO: add more tests once we get Phantom to recognize our custom elements.
*/

function testFeedbackForm(test) {
    test.assertElementCount('.feedback-form', 1,
                            'Only one feedback form/modal exists');

    test.assertExists('.potato-captcha');
    test.assertNotVisible('.potato-captcha');

    test.assertVisible('[name="feedback"]');

    test.assert(!helpers.checkValidity('.feedback-form'));

    casper.fill('.feedback-form', {'feedback': 'test'});
    test.assert(helpers.checkValidity('.feedback-form'));
}


casper.test.begin('Test feedback page', {
    test: function(test) {
        helpers.startCasper({path: '/feedback'});
        casper.waitUntilVisible('.feedback-form', function() {
            testFeedbackForm(test);
        });
        helpers.done(test);
    }
});


casper.test.begin('Test feedback modal on desktop', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        helpers.waitForPageLoaded(function() {
            test.assertUrlMatch(/\//);
            casper.click('.submit-feedback');
        });

        casper.waitForSelector('.feedback-form', function() {
            testFeedbackForm(test);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test feedback page on desktop', {
    test: function(test) {
        helpers.startCasper({path: '/feedback', viewport: 'desktop'});

        helpers.waitForPageLoaded(function() {
            testFeedbackForm(test);
            casper.click('.submit-feedback');
            helpers.assertHasFocus('.feedback-form textarea');
        });

        helpers.done(test);
    }
});
