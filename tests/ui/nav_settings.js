function navSetUp(cb) {
    helpers.waitForPageLoaded(function() {
        casper.evaluate(function() {
            var settings = window.require('core/settings');
            var z = window.require('core/z');
            var headerFooter = window.require('header_footer');

            settings.mktNavEnabled = true;
            headerFooter.renderHeader();
        });
    });

    return casper.waitForSelector('mkt-nav', function() {
        casper.evaluate(function() {
            var z = window.require('core/z');
            z.page.trigger('navigate');
        });
        cb();
    });
}


casper.test.begin('Test mkt-nav settings navigation', {
    test: function(test) {
        helpers.startCasper();

        navSetUp(function() {
            casper.click('.mkt-nav--toggle');

            test.assertVisible('[data-mkt-nav--item="feedback"]');
            test.assertVisible('[data-mkt-nav--item="register"]');
            test.assertVisible('[data-mkt-nav--item="login"]');
            helpers.capture('lol.png');
            test.assertNotVisible('[data-mkt-nav--item="settings"]');
            test.assertNotVisible('[data-mkt-nav--item="purchases"]');
            test.assertNotVisible('[data-mkt-nav--item="logout"]');

            casper.click('[data-mkt-nav--item="feedback"] a');
        });

        casper.waitForSelector('[data-page-type~="feedback"]', function() {
            casper.click('[data-mkt-nav--item="login"] a');
            helpers.fake_login();
        });

        casper.waitForSelector('.logged-in', function() {
            casper.click('[data-mkt-nav--item="purchases"] a');
        });

        casper.waitForSelector('[data-page-type~="purchases"]', function() {
            casper.click('[data-mkt-nav--item="settings"] a');
        });

        casper.waitForSelector('[data-page-type~="settings"]', function() {
            casper.click('[data-mkt-nav--item="logout"] a');
        });

        casper.waitWhileSelector('.logged-in');

        helpers.done(test);
    }
});
