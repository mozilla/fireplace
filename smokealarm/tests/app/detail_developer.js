var suite = require('./kasperle').suite();

suite.run('/app/developer', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Detail page tests for apps as a developer', function(assert) {
        assert.URL(/\/app\/developer/);
        suite.capture('detail_developer.png');

        assert.invisible('.expand-toggle');
        assert.hasText('h3');

        assert.textIsnt('.mkt-tile h3', 'Loading...');
        assert.selectorExists('.button.manage');  // "Edit Listing" button
        assert.selectorDoesNotExist('.button.reviewer');  // "Approve/Reject" / "Review History" button
    });

});
