var suite = require('./kasperle').suite();

suite.run('/', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#featured');
    });

    test('Click on featured app', function() {
        suite.press('#featured ol li a:first-child');
    });

    waitFor(function() {
        // Wait for reviews to load in.
        return suite.exists('.reviews h3');
    });

    test('Detail page baseline tests', function(assert) {
        assert.URL(/\/app\/[a-zA-Z0-9]+/);
        //assert.invisible('#search-q');
        assert.invisible('.expand-toggle');
        assert.hasText('h3');

        assert.validText('.mkt-tile h3', 'Loading...');  // Has a name
        assert.validText('.mkt-tile .price', 'Loading...');  // Has a price
        assert.hasText('.detail .info .author');  // Has an author
        assert.visible('.detail .icon');  // Visible icon
        assert.visible('.detail .info button.install');  // Visible icon
        assert.visible('.tray.previews');  // Visible previews section
        assert.visible('.tray.previews img');  // Has visible previews
        assert.visible('.tray.previews .dots .dot');  // Has dots for the previews section
        assert.selectorExists('.tray.previews .dots .current');  // At least one of the dots is selected
        assert.hasText('.blurbs .summary');  // Has summary/description
        assert.visible('section.support .support-email a');  // Has a support email button
        assert.visible('section.support .homepage a');  // Has a homepage button
        assert.visible('section.support .privacy-policy a');  // Has a privacy policy button

        assert.selectorExists('.support ul li');

        suite.capture('detail.png');
    });
});
