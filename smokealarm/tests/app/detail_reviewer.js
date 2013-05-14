var suite = require('./kasperle').suite();
var lib = require('./lib');

suite.run('/app/developer', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Detail page tests for apps as a reviewer with Apps:Edit (developer) permissions', function(assert) {
        // Mock the user module to have "reviewer" permissions.
        suite.evaluate(function() {
            console.log('[*][phantom] Giving user "reviewer" permissions');
            window.require('user').update_permissions({reviewer: true});
            require('views').reload();
        });

        assert.URL(/\/app\/developer/);
        suite.capture('detail_owner.png');

        assert.invisible('.expand-toggle');
        assert.hasText('h3');

        assert.textIsnt('.mkt-tile h3', 'Loading...');
        assert.selectorExists('.button.manage');  // "Edit Listing" button
        assert.selectorExists('.button.reviewer');  // "Approve/Reject" / "Review History" button
    });

});
