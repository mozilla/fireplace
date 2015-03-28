/*
    Test the mkt-nav element.
    Currently flagged so render it manually for now.
*/
function navSetUp(cb) {
    helpers.waitForPageLoaded(function() {
        casper.evaluate(function() {
            var settings = window.require('core/settings');
            var z = window.require('core/z');
            var headerFooter = window.require('header_footer');

            settings.mktNavEnabled = true;
            headerFooter.renderHeader();
            z.page.trigger('navigate');
        });
    });

    return casper.waitForSelector('mkt-nav', cb);
}


casper.test.begin('Test mkt-nav settings flag', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            test.assertDoesntExist('mkt-nav');
            test.assertDoesntExist('mkt-nav-root');
            test.assertDoesntExist('mkt-nav-child');
            test.assertExists('main #site-nav');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test mkt-nav toggle', {
    test: function(test) {
        helpers.startCasper();

        navSetUp(function() {
            // Hidden at first.
            test.assertDoesntExist('.mkt-nav--visible mkt-nav');

            // It opens when click toggle.
            casper.click('.mkt-nav--toggle');
            test.assertExists('.mkt-nav--visible mkt-nav');

            // It closes when click toggle.
            casper.click('.mkt-nav--toggle');
            test.assertDoesntExist('.mkt-nav--visible mkt-nav');

            // It closes when click link.
            casper.click('.mkt-nav--toggle');
            test.assertExists('.mkt-nav--visible mkt-nav');
            casper.click('[data-mkt-nav--link="popular"]');
            test.assertDoesntExist('.mkt-nav--visible mkt-nav');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test mkt-nav navigation', {
    test: function(test) {
        helpers.startCasper();

        navSetUp(function() {
            casper.click('.mkt-nav--toggle');
            test.assertExists('[data-mkt-nav--link="homepage"].mkt-nav--active');
            casper.click('[data-mkt-nav--link="new"]');
        });

        casper.waitForSelector('[data-page-type~="new"]', function() {
            test.assertExists('[data-mkt-nav--link="new"].mkt-nav--active');
            casper.click('.mkt-nav--toggle');
            casper.click('[data-mkt-nav--link="popular"]');
        });

        casper.waitForSelector('[data-page-type~="popular"]', function() {
            test.assertExists('[data-mkt-nav--link="popular"].mkt-nav--active');
            casper.click('.mkt-nav--toggle');
            casper.click('[data-mkt-nav--link="homepage"]');
        });

        casper.waitForSelector('[data-page-type~="homepage"]', function() {
            test.assertExists('[data-mkt-nav--link="homepage"].mkt-nav--active');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test mkt-nav subnavs', {
    test: function(test) {
        helpers.startCasper();

        navSetUp(function() {
            casper.click('.mkt-nav--toggle');
            test.assertDoesntExist('.mkt-nav--subnav-visible');

            casper.click('[data-mkt-nav--link="categories"]');
            test.assertExists('.mkt-nav--subnav-visible');

            casper.click('[data-mkt-nav--link="games"]');
        });

        casper.waitForSelector('[data-page-type~="category"]', function() {
            casper.wait(250, function() {
                test.assertDoesntExist('.mkt-nav--visible');
                test.assertDoesntExist('.mkt-nav--subnav-visible');
            });
            test.assertExists('[data-mkt-nav--link="games"].mkt-nav--active');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test mkt-nav navigation desktop', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        navSetUp(function() {
            test.assertExists('[data-mkt-nav--link="homepage"].mkt-nav--active');
            casper.click('[data-mkt-nav--link="new"]');
        });

        casper.waitForSelector('[data-page-type~="new"]', function() {
            test.assertExists('[data-mkt-nav--link="new"].mkt-nav--active');
            casper.click('[data-mkt-nav--link="popular"]');
        });

        casper.waitForSelector('[data-page-type~="popular"]', function() {
            test.assertExists('[data-mkt-nav--link="popular"].mkt-nav--active');
            casper.click('[data-mkt-nav--link="homepage"]');
        });

        casper.waitForSelector('[data-page-type~="homepage"]', function() {
            test.assertExists('[data-mkt-nav--link="homepage"].mkt-nav--active');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test mkt-nav subnavs desktop', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        navSetUp(function() {
            // Starts not visible.
            test.assertDoesntExist('.mkt-nav--subnav-visible');
            test.assertDoesntExist('[data-mkt-nav--link="categories"].mkt-nav--showing-child');

            // Subnav toggle to show.
            casper.click('[data-mkt-nav--link="categories"]');
            test.assertExists('[data-mkt-nav--link="categories"].mkt-nav--showing-child');
            test.assertExists('.mkt-nav--subnav-visible');

            // Subnav toggle to hide.
            casper.click('[data-mkt-nav--link="categories"]');
            test.assertDoesntExist('.mkt-nav--subnav-visible');

            // Navigate using subnav.
            casper.click('[data-mkt-nav--link="categories"]');
            casper.click('[data-mkt-nav--link="games"]');
        });

        casper.waitForSelector('[data-page-type~="category"]', function() {
            casper.wait(250, function() {
                test.assertDoesntExist('.mkt-nav--subnav-visible');
            });
            test.assertExists('[data-mkt-nav--link="games"].mkt-nav--active');
        });

        helpers.done(test);
    }
});
