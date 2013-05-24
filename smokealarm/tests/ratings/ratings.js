var suite = require('./kasperle').suite();

suite.run('/app/can_rate', function(test, waitFor) {

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

    test('Ratings page baseline tests', function(assert) {
        assert.URL(/\/app\/can_rate\/ratings/);

        assert.hasText('#write-review');

        assert.visible('.report-spam');
        assert.selectorExists('.report-spam ul li a');

        // Once this is finalized we should test the report review API call
        // and other parts of the review listing page.

        suite.capture('ratings-report.png');
    });
});
