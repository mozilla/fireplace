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
            casper.click('[data-mkt-nav--item="popular"] a');
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
            test.assertExists('[data-mkt-nav--item="homepage"] .mkt-nav--active');
            casper.click('[data-mkt-nav--item="new"] a');
        });

        casper.waitForSelector('[data-page-type~="new"]', function() {
            test.assertExists('[data-mkt-nav--item="new"] .mkt-nav--active');
            casper.click('.mkt-nav--toggle');
            casper.click('[data-mkt-nav--item="popular"] a');
        });

        casper.waitForSelector('[data-page-type~="popular"]', function() {
            test.assertExists('[data-mkt-nav--item="popular"] .mkt-nav--active');
            casper.click('.mkt-nav--toggle');
            casper.click('[data-mkt-nav--item="homepage"] a');
        });

        casper.waitForSelector('[data-page-type~="homepage"]', function() {
            test.assertExists('[data-mkt-nav--item="homepage"] .mkt-nav--active');
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

            casper.click('mkt-nav [data-mkt-nav--item="categories"] a');
            test.assertExists('.mkt-nav--subnav-visible');

            casper.click('mkt-nav [data-mkt-category-slug="games"] a');
        });

        casper.waitForSelector('[data-page-type~="category"]', function() {
            casper.wait(250, function() {
                test.assertDoesntExist('.mkt-nav--visible');
                test.assertDoesntExist('.mkt-nav--subnav-visible');
            });
        });

        helpers.done(test);
    }
});


casper.test.begin('Test mkt-nav back', {
    test: function(test) {
        helpers.startCasper('/app/foo');

        navSetUp(function() {
            test.assertVisible('.mkt-header--back');
            casper.click('.mkt-header--back');
        });

        casper.waitForSelector('[data-page-type~="homepage"]');

        helpers.done(test);
    }
});


casper.test.begin('Test mkt-nav back not on desktop', {
    test: function(test) {
        helpers.startCasper('/app/foo', {viewport: 'desktop'});

        navSetUp(function() {
            test.assertNotVisible('.mkt-header--back');
        });

        helpers.done(test);
    }
});
