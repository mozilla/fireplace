var helpers = require('../lib/helpers');

casper.test.begin('App abuse tests', {
    test: function(test) {
        helpers.startCasper({path: '/app/foo/abuse'});

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
