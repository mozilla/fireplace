var helpers = require('../lib/helpers');

casper.test.begin('App abuse tests', {
    test: function(test) {
        helpers.startCasper('/app/foo/abuse');

        helpers.waitForPageLoaded(function() {
            test.assertTitle('Report Abuse | Firefox Marketplace');
            test.assertVisible('.abuse-form');
            test.assertVisible('.abuse-form textarea');

            casper.fill('.abuse-form', {'text': 'test'});
            casper.click('.abuse-form button');
            test.assertUrlMatch(/\/app\/foo/);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test app abuse on desktop', {
    test: function(test) {
        helpers.startCasper('/app/foo/', {viewport: 'desktop'});

        helpers.waitForPageLoaded(function() {
            casper.click('.app-report-abuse .button');
            test.assertVisible('.abuse-form');
            test.assertVisible('.abuse-form textarea');
            test.assertUrlMatch(/\/app\/foo/);
        });

        casper.waitForSelector('.abuse-form', function() {
            test.assertElementCount('.abuse-form', 1,
                                    'Only one abuse form/modal exists');

            test.assertExists('.abuse-form input[type="hidden"][value="foo"]');
            test.assertExists('.potato-captcha');
            test.assertNotVisible('.potato-captcha');

            test.assert(!helpers.checkValidity('.abuse-form'));

            casper.fill('.abuse-form', {'text': 'test'});
            test.assert(helpers.checkValidity('.abuse-form'));
        });

        helpers.done(test);
    }
});
