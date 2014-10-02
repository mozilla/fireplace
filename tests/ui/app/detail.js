var helpers = require('../../helpers');

helpers.startCasper();

casper.test.begin('Detail Page baseline tests', {

    test: function(test) {

        casper.waitForSelector('.app-link', function() {
            casper.click('.app-link');
        });

        casper.waitForSelector('.reviews h3', function() {
            test.assertUrlMatch(/\/app\/[a-zA-Z0-9]+/);
            test.assertNotVisible('.expand-toggle');
            helpers.assertContainsText('h3');
            helpers.assertContainsText('.mkt-tile h3');
            test.assertSelectorDoesntHaveText('.mkt-tile h3', 'Loading...');
            helpers.assertContainsText('.mkt-tile .price');
            test.assertSelectorDoesntHaveText('.mkt-tile .price', 'Loading...');
            helpers.assertContainsText('.detail .info .author');  // Has an author
            test.assertVisible('.detail .icon');  // Visible icon
            test.assertVisible('.detail .info button.install');  // Visible icon
            test.assertVisible('.tray.previews');  // Visible previews section
            test.assertExists('.tray.previews img');  // Has preview images
            test.assertVisible('.tray.previews .dots .dot');  // Has dots for the previews section
            test.assertExists('.tray.previews .dots .current');  // At least one of the dots is selected
            helpers.assertContainsText('.blurbs .description');  // Has description
            test.assertVisible('section.support .support-email a');  // Has a support email button
            test.assertVisible('section.support .homepage a');  // Has a homepage button
            test.assertVisible('section.support .privacy-policy a');  // Has a privacy policy button
            test.assertExists('.support ul li');
            var href = this.getElementAttribute('.mkt-tile .info .author a', 'href');
            test.assertEqual(href.split('=')[0], '/search?author');
        });

        casper.run(function() {
            test.done();
        });
    }
});
