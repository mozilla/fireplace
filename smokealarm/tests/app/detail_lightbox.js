var suite = require('./kasperle').suite();

suite.run('/', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Click on featured app', function() {
        suite.press('#featured ol li a:first-child');
    });

    waitFor(function() {
        return suite.exists('.reviews h3');
    });

    test('Test preview image exists and click it.', function(assert) {
        assert.selectorExists('.slider li:first-child .screenshot');
        suite.press('.slider li:first-child .screenshot');
    });

    waitFor(function() {
        return suite.visible('#lightbox');
    });

    test('Test lightbox is opened', function(assert) {
        assert.visible('#lightbox', 'Lightbox is visible');
        suite.back();
    });

    waitFor(function() {
        return !suite.visible('#lightbox');
    });

    test('Test lightbox is closed', function(assert) {
        assert.invisible('#lightbox', 'Lightbox should be invisible');
    });
});
