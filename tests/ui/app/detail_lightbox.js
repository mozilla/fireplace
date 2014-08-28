var helpers = require('../../helpers');

helpers.startCasper();

casper.test.begin('Test lightbox', {

    test: function(test) {

        casper.waitForSelector('.app-link', function() {
            casper.click('.app-link');
        });

        casper.waitForSelector('.slider li:first-child .screenshot img', function() {
            test.assertExists('.slider li:first-child .screenshot img', 'Check preview image exists');
            casper.click('.slider li:first-child .screenshot img');
        });

        casper.waitForSelector('#lightbox.show', function() {
            test.assertExists('#lightbox.show', 'Lightbox is visible');
            casper.back();
        });

        casper.waitWhileVisible('#lightbox', function() {
            test.assertNotVisible('#lightbox', 'Lightbox should be invisible');
        });

        casper.run(function() {
           test.done();
        });
    }
});
