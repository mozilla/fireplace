var suite = require('./kasperle').suite();

suite.run('/app/foo', function(test, waitFor) {

    waitFor(function() {
        // Wait for reviews to load in.
        return suite.exists('.reviews ul, .reviews p.not-rated');
    });

    test('Click on reviews button', function() {
        suite.press('.reviews .average-rating');
    });

    waitFor(function() {
        // Wait for reviews list.
        return suite.exists('.reviews-listing');
    });

    test('Click on report review', function() {
        suite.press('.reviews-listing .actions .flag');
    });

    waitFor(function() {
        // Wait for flag dialogue
        return suite.exists('#flag-review');
    });

    test('Ratings page baseline tests', function(assert) {
        assert.URL(/\/app\/foo\/ratings/);

        assert.hasText('#write-review');

        assert.visible('#flag-review');
        assert.selectorExists('#flag-review ul li a');

        // Once this is finalized we should test the report review API call
        // and other parts of the review listing page.

        suite.capture('ratings-report.png');
    });
});
