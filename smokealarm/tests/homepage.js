var suite = require('./kasperle').suite({viewportSize: {
    width: 1024,
    height: 768
}});

suite.run('/', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    test('Homepage baseline tests', function(assert) {
        assert.title('Firefox Marketplace');

        assert.visible('.wordmark');
        assert.visible('.header-button.settings');  // Persona not visible at mobile width :O
        assert.visible('#search-q');

        assert.selectorExists('#featured-home');
        assert.selectorExists('#featured-home ul.grid li a h3:not(:empty)');
        assert.visible('#featured-home a .price');
        assert.visible('#featured-home a .rating');

        assert.selectorExists('.categories');
        assert.selectorExists('.categories ul li a h3:not(:empty)');

        suite.capture('homepage.png');
    });
});
