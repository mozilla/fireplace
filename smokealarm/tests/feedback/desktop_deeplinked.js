// Desktop tests for feedback modal when deeplinked to the feedback page.
var suite = require('./kasperle').suite();

// Desktop only tests.
suite.marionetteSkip = true;

suite.setUp = function(){
    suite.viewport(720, 500);
};

suite.tearDown = function(){
    suite.viewport(400, 300);
};

// Test the actual feedback page for both the modal and inline feedback forms.
suite.run('/feedback', function(test, waitFor) {
    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Both modal and regular form exist', function(assert) {
        assert.visible('.feedback:not(.modal)');
        assert.selectorExists('.feedback.modal');
    });
});
