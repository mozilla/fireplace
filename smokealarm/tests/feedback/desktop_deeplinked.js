// Desktop tests for deeplinking to the feedback page.
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

    test('Check regular form exists', function(assert) {
        assert.visible('.feedback:not(.modal)');
        suite.press('.submit-feedback');
        assert.hasFocus('.simple-field textarea', 'Textarea should have focus');
    });
});
