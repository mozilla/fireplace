var suite = require('./kasperle').suite();

suite.run('/app/foo', function(test, waitFor) {

    waitFor(function() {
        // Wait for reviews to load in.
        return suite.exists('.reviews h3');
    });

    test('Click on reviews button', function() {
        suite.press('.reviews .average-rating');
    });

    waitFor(function() {
        // Wait for reviews list.
        return suite.exists('.main #add-review.primary-button');
    });

    test('Click on report review', function() {
        suite.press('.reviews .actions .flag');
    });

    test('Ratings page baseline tests', function(assert) {
        assert.URL(/\/app\/foo\/ratings/);

        assert.hasText('#write-review');

        assert.visible('.report-spam.show');
        assert.selectorExists('.report-spam.show ul li a');

        // Once this is finalized we should test the report review API call
        // and other parts of the review listing page.

        suite.capture('ratings-report.png');
    });
});
