var suite = require('./kasperle').suite();

suite.run('/', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#splash-overlay.hide');
    });

    // test('Click on category from homepage', function() {
    //     suite.press('.categories ul li a:first-child');
    // });

    waitFor(function() {
        return suite.exists('#search-results li a');
    });

    test('Category baseline tests', function(assert) {
        assert.URL(/\/category\/[a-zA-Z0-9]+/);
        suite.capture('category.png');

        //assert.invisible('h1.site', 'Wordmark should be hidden');
        assert.visible('#search-q');
        assert.visible('.expand-toggle');

        assert.selectorExists('#featured.creatured');
        assert.selectorExists('#featured.creatured ol.grid li a h3:not(:empty)');

        assert.visible('#search-results');
        assert.visible('#search-results ol.listing li a.mkt-tile');

        suite.press('#search-results ol.listing li a.mkt-tile:first-child');

    });

    test('Continue to detail page', function(assert) {
        assert.URL(/\/app\/[a-zA-Z0-9]+/);
    });
});
