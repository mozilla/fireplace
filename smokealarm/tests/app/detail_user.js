var suite = require('./kasperle').suite();

suite.run('/app/user', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Detail page tests for apps as an end user', function(assert) {
        assert.URL(/\/app\/user/);
        suite.capture('detail_user.png');

        assert.invisible('.expand-toggle');
        assert.hasText('h3');

        assert.textIsnt('.mkt-tile h3', 'Loading...');
        assert.selectorDoesNotExist('.button.manage');  // "Edit Listing" button
        assert.selectorDoesNotExist('.button.reviewer');  // "Approve/Reject" / "Review History" button
    });

});
