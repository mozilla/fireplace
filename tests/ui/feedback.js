/*
    Tests for the feedback form on both desktop and mobile.
    In some cases the form is a modal, in others it is a page.
    TODO: add more tests once we get Phantom to recognize our custom elements.
*/
var helpers = require('../lib/helpers');

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
    setUp: helpers.setUpDesktop,
    tearDown: helpers.tearDown,
    test: function(test) {
        helpers.startCasper();

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
    setUp: helpers.setUpDesktop,
    tearDown: helpers.tearDown,
    test: function(test) {
        helpers.startCasper({path: '/feedback'});

        helpers.waitForPageLoaded(function() {
            testFeedbackForm(test);
            casper.click('.submit-feedback');
            helpers.assertHasFocus('.feedback-form textarea');
        });

        helpers.done(test);
    }
});
