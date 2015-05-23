casper.test.begin('Test website issue', {
    test: function(test) {
        helpers.startCasper('/website/5/issue');

        helpers.waitForPageLoaded(function() {
            test.assertTitle('Report an Issue | Firefox Marketplace');
            test.assertVisible('.issue-form');
            test.assertVisible('.issue-form textarea');

            casper.fill('.issue-form', {'text': 'test'});
            casper.click('.issue-form button');
            test.assertUrlMatch(/\/website\/5/);
        });

        helpers.done(test);
    }
});
