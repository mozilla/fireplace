var suite = require('./kasperle').suite();

suite.run('/', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('#featured');
    });

    test('Click on featured app', function() {
        suite.press('#featured ol li a:first-child');
    });

    waitFor(function() {
        // Wait for reviews to load in.
        return suite.exists('.reviews ul, .reviews p.not-rated');
    });

    test('Detail page baseline tests', function(assert) {
        assert.URL(/\/app\/[a-zA-Z0-9]+/);
        //assert.invisible('#search-q');
        assert.invisible('.expand-toggle');
        assert.hasText('h3');

        assert.textIsnt('.mkt-tile h3', 'Loading...');
        assert.textIsnt('.mkt-tile .price', 'Loading...');

        assert.hasText('.blurbs .summary');

        assert.selectorExists('.support ul li');

        suite.capture('detail.png');
    });
});
