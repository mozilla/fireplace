function headerSetUp(cb) {
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

    return casper.waitForSelector('mkt-header', cb);
}


casper.test.begin('Test header search toggle', {
    test: function(test) {
        helpers.startCasper();

        headerSetUp(function() {
            test.assertExists('mkt-header');
            test.assertDoesntExist('header#site-header');

            test.assertDoesntExist(
                '.header--search.mkt-header-child--visible');
            casper.click('mkt-header-child-toggle[for="header--search"]');
            test.assertExists('.header--search.mkt-header-child--visible');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test header search submit', {
    test: function(test) {
        helpers.startCasper();

        headerSetUp(function() {
            casper.fill('.header--search-form', {q: 'games'}, true);
        });

        casper.waitForSelector('.app-list', function() {
            test.assertUrlMatch(/\/search\?q=games$/);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test search toggle hides categories subnav', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        headerSetUp(function() {
            casper.click('[data-toggle-subnav="categories"]');
            test.assertExists('#categories.mkt-nav--visible');

            casper.click('mkt-header-child-toggle[for="header--search"]');
            test.assertDoesntExist('#categories.mkt-nav--visible');
            test.assertExists('.header--search.mkt-header-child--visible');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test categories subnav hides search header child', {
    test: function(test) {
        helpers.startCasper();

        headerSetUp(function() {
            casper.click('mkt-header-child-toggle[for="header--search"]');
            test.assertExists('.header--search.mkt-header-child--visible');

            casper.click('[data-toggle-subnav="categories"]');
            test.assertDoesntExist('.header--search.mkt-header-child--visible');
            test.assertExists('#categories.mkt-nav--visible');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test header settings visibility', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        headerSetUp(function() {
            test.assertVisible('mkt-header .persona');
            test.assertVisible('mkt-header .persona.register');
            test.assertDoesntExist('.header--settings.mkt-header-child--visible');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test header settings toggle', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        headerSetUp(function() {
            casper.click('mkt-header .persona:not(.register)');
            helpers.fake_login();
        });

        casper.waitForSelector('.logged-in', function() {
            test.assertNotVisible('mkt-header .persona');
            test.assertNotVisible('mkt-header .persona.register');
            casper.click('.header--settings-toggle');

            test.assertVisible('.header--settings.mkt-header-child--visible');
            test.assertVisible('[data-mkt-header-child--item="feedback"]');
            test.assertVisible('[data-mkt-header-child--item="settings"]');
            test.assertVisible('[data-mkt-header-child--item="purchases"]');
            test.assertVisible('[data-mkt-header-child--item="logout"]');
        });

        helpers.done(test);
    }
});
