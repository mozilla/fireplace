var helpers = require('../../lib/helpers');

helpers.startCasper({path: '/feedback'});

casper.test.begin('Deeplinked feedback on desktop', {

    setUp: function() {
        casper.echo('Setting up', 'INFO');
        casper.viewport(720, 500);
    },

    tearDown: function() {
        casper.echo('Tearing down', 'INFO');
        casper.viewport(400, 300);
    },

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertVisible('.feedback:not(.modal)');
            casper.click('.submit-feedback');
            helpers.assertHasFocus('.simple-field textarea', 'Textarea should have focus');
        });

        casper.run(function() {
           test.done();
        });
    }
});
