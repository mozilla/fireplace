var helpers = require('../../helpers');

helpers.startCasper({path: '/app/outgoing-links'});


var REAL_HREF = 'http://www.amazon.com/Jurassic-Park-Swaggasaurus-T-Shirt-' +
    'White/dp/B00BUZZGAS?tag=designbooksho-20';
var OUTGOING_HREF = 'http://outgoing.mozilla.org/v1/cd3278ee3a8ceee0e5/' +
    'http%3A//www.amazon.com/Jurassic-Park-Swaggasaurus-T-Shirt-White/dp/' +
    'B00BUZZGAS%3Ftag=designbooksho-20';

// Anchor links to `http://www.amazon.com/...`.
var REAL_SELECTOR = 'a[data-orig-href="' + OUTGOING_HREF + '"]' +
    '[href="' + REAL_HREF + '"]';

// Anchor links to `http://outgoing.mozilla.org/...`.
var OUTGOING_SELECTOR = 'a[data-orig-href="' + OUTGOING_HREF + '"]' +
    '[href="' + OUTGOING_HREF + '"]';


casper.test.begin('Test outgoing links in app descriptions work properly', {

    test: function(test) {
        // Test that an outgoing link has the correct attributes.
        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertUrlMatch(/\/app\/outgoing-links/);

            // The URL is `http://www.amazon.com/...`.
            test.assertElementCount(REAL_SELECTOR, 1,
                'URL is `http://www.amazon.com/...`');

            // Mocking here to prevent the link from taking us to another page.
            this.evaluate(function() {
                $('.description a[data-orig-href]').on('click', function(e) {
                    e.preventDefault();
                });
            });

            // Click the link.
            this.click(REAL_SELECTOR);

            // The URL is now `http://outgoing.mozilla.org/...`.
            test.assertElementCount(OUTGOING_SELECTOR, 1,
                'URL is `http://outgoing.mozilla.org/...`');

            // The URL changes back after a 100 ms `setTimeout`.
            this.wait(110, function() {
                // The URL reverts back to `http://www.amazon.com/...`.
                test.assertElementCount(REAL_SELECTOR, 1,
                    'URL is `http://www.amazon.com/...`');
            });
        });

        // TODO: Test that when the Marketplace is viewed in an app (mocking
        // `capabilities.chromeless`), all outgoing links are `target="_blank"`.

        casper.run(function() {
           test.done();
        });
    }
});
