function headerSetUp(cb) {
    helpers.waitForPageLoaded(function() {
        casper.waitForSelector('.global-nav-menu-desktop', cb);
    });
}


casper.test.begin('Test desktop navigation', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        headerSetUp(function() {
            casper.click('.global-nav-menu-desktop .new');
        });

        casper.waitForSelector('[data-page-type~="new"]', function() {
            test.assertExists('.new.header-nav-link-active');
            casper.click('.global-nav-menu-desktop .popular');
        });

        casper.waitForSelector('[data-page-type~="popular"]', function() {
            test.assertExists('.popular.header-nav-link-active');
            casper.click('.global-nav-menu-desktop .home');
        });

        casper.waitForSelector('[data-page-type~="homepage"]', function() {
            test.assertExists('.home.header-nav-link-active');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test categories toggle', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        headerSetUp(function() {
            // Starts not visible.
            test.assertDoesntExist('.cat-menu-overlay.overlay-visible');

            // Click toggle to show.
            casper.click('.nav-category-link');
            test.assertExists('.cat-menu-overlay.overlay-visible');

            // Click toggle to hide.
            casper.click('.nav-category-link');
            test.assertDoesntExist('.cat-menu-overlay.overlay-visible');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test header search toggle', {
    test: function(test) {
        helpers.startCasper();

        headerSetUp(function() {
            test.assertExists('.global-header');
            test.assertDoesntExist('header#site-header');

            test.assertDoesntExist('.global-header.searching');
            casper.click('.header--search-content .mkt-search-btn');
            test.assertExists('.global-header.searching');
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
            casper.click('.nav-category-link');
            test.assertExists('.cat-menu-overlay.overlay-visible');

            casper.click('.search-btn-desktop');
            test.assertDoesntExist('.cat-menu-overlay.overlay-visible');
            test.assertExists('.desktop-search.searching');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test categories subnav hides search header child', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        headerSetUp(function() {
            casper.click('.search-btn-desktop');
            test.assertExists('.desktop-search.searching');

            casper.click('.nav-category-link');
            test.assertDoesntExist('.desktop-search.searching');
            test.assertExists('.cat-menu-overlay.overlay-visible');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test header settings visibility', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        headerSetUp(function() {
            test.assertVisible('.global-nav-menu-desktop .persona');
            test.assertVisible('.global-nav-menu-desktop .persona.register');
            test.assertDoesntExist('.settings-menu-desktop.settings-menu-active');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test header settings toggle', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        headerSetUp(function() {
            casper.click('.global-nav-menu-desktop .persona:not(.register)');
            helpers.fake_login();
        });

        casper.waitForSelector('.logged-in', function() {
            test.assertNotVisible('.global-nav-menu-desktop .persona');
            test.assertNotVisible('.global-nav-menu-desktop .persona.register');
            casper.click('.mkt-settings-btn');

            test.assertExists('.settings-menu-desktop.settings-menu-active');
        });

        helpers.done(test);
    }
});
