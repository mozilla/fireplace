var helpers = require('../lib/helpers');

casper.test.begin('Category app list sort tests', {
    test: function(test) {
        casper.viewport(1050, 768);  // Sort filters only show on desktop.
        helpers.startCasper({path: '/category/games'});

        casper.waitForSelector('.app-list', function() {
            // Test popular link is active by default.
            test.assertVisible('.app-list-sort');
            test.assertSelectorExists('[data-app-list-sort-popular].active');

            // Test switch to new.
            casper.click('[data-app-list-sort-new]');
        });

        casper.waitForSelector('.app-list', function() {
            test.assert(casper.getCurrentUrl().indexOf('sort=reviewed') !== -1);
            test.assertSelectorExists('[data-app-list-sort-new].active');

            // Test switch back to popular.
            casper.click('[data-app-list-sort-popular]');
            test.assert(casper.getCurrentUrl().indexOf('sort=reviewed') === -1);
            test.assertSelectorExists('[data-app-list-sort-popular].active');
        });

        casper.run(function() {
            test.done();
            casper.viewport(300, 400);
        });
    }
});
