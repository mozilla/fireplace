var helpers = require('../helpers');

helpers.startCasper({path: '/new'});

casper.test.begin('New baseline tests', {

    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            test.assertExists('.app-list li.app:nth-child(24)');
            test.assertDoesntExist('.app-list li.app:nth-child(25)');
            test.assertExists('.app-list li.loadmore');
            helpers.assertAPICallWasMade('/api/v2/fireplace/search/', {
                cache: '1', lang: 'en-US', limit: '24', region: 'us',
                sort: 'reviewed', vary: '0'
            });
            var href = this.getElementAttribute('.app-list li a.app-link:nth-child(1)', 'href');
            test.assertEqual(href.split('?')[1], 'src=new');
        });

        casper.run(function() {
            test.done();
        });
    }
});
