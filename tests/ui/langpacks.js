var helpers = require('../lib/helpers');


casper.test.begin('Test langpacks results', {
    test: function(test) {
        helpers.startCasper({path: '/langpacks/2.2'});

        casper.waitForSelector('.langpacks .app-list', function() {
            test.assertSelectorHasText('.secondary-header h2',
                                       'Firefox OS 2.2');
            test.assertUrlMatch(/\/langpacks\/2.2/);
            test.assertDoesntExist('.app-list-filters', 'Check compatibility filtering is not found');

            test.assertSelectorHasText('.langpacks .install em', 'Install');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test langpacks empty', {
    test: function(test) {
        helpers.startCasper({path: '/langpacks/empty'});

        helpers.waitForPageLoaded(function() {
            test.assertUrlMatch(/\/langpacks\/empty/);
            test.assertExists('.no-results', 'Check no-results header is found');
            test.assertDoesntExist('.app-list');
            test.assertDoesntExist('.app-list-filters', 'Check compatibility filtering is not found');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test langpacks XSS', {
    test: function(test) {
        helpers.startCasper({
            path: '/langpacks/%3Cscript+id%3D%22%23xss-script%22%3E%3C%2Fscript%3E'
        });

        helpers.waitForPageLoaded(function() {
            test.assertDoesntExist('#xss-script');
        });

        helpers.done(test);
    }
});
