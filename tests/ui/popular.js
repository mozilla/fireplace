var helpers = require('../helpers');

helpers.startCasper({path: '/popular'});

casper.test.begin('Popular baseline tests', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertExists('.app-list li.app:nth-child(24)');
            test.assertDoesntExist('.app-list li.app:nth-child(25)');
            test.assertExists('.app-list li.loadmore');
            helpers.assertAPICallWasMade('/api/v2/fireplace/search/', {
                cache: '1', lang: 'en-US', limit: '24', region: 'us', vary: '0'
            });
            var href = this.getElementAttribute('.app-list li a.app-link:nth-child(1)', 'href');
            test.assertEqual(href.split('?')[1], 'src=popular');
        });

        casper.run(function() {
            test.done();
        });
    }
});
