var helpers = require('../../helpers');

helpers.startCasper({path: '/app/foo/abuse'});

casper.test.begin('Abuse baseline tests', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertTitle('Report Abuse | Firefox Marketplace');
            test.assertVisible('.abuse-form');
            test.assertVisible('.abuse-form textarea');
            test.assertExists('.abuse-form button[disabled]');
            casper.fill('.abuse-form', {'text': 'test'});
            test.assertExists('.abuse-form button:not([disabled])');
            test.assertUrlMatch(/\/app\/foo\/abuse/);
            casper.click('.abuse-form button');
            test.assertUrlMatch(/\/app\/foo/);
        });

        casper.run(function() {
            test.done();
        });
    }
});
