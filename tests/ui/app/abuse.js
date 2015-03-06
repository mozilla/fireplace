var helpers = require('../../lib/helpers');


casper.test.begin('Test app abuse', {
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


casper.test.begin('Test UA app abuse', {
    test: function(test) {
        helpers.startCasper({path: '/app/foo/'});

        helpers.waitForPageLoaded(function() {
            casper.click('.app-report-abuse .button');
            helpers.assertUASendEvent(test, [
                'App view interaction',
                'click',
                'Report abuse'
            ]);
        });

        helpers.done(test);
    }
});
