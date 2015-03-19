casper.test.begin('Test UA desktop promo src persists to app detail page', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        helpers.waitForPageLoaded(function() {
            var slug = casper.evaluate(function() {
                var slug;
                $('.desktop-promo-item').each(function(i, item) {
                    if (item.getAttribute('href').indexOf('collection') !== -1) {
                        slug = item.getAttribute('data-tracking');
                    }
                });
                return slug;
            });
            casper.click('[data-tracking="' + slug + '"]');
        });

        casper.waitForSelector('.app-list', function() {
            casper.click('.mkt-tile');
        });

        casper.waitForSelector('[data-page-type~="detail"]', function() {
            var src = casper.evaluate(function() {
                return window.require('core/utils').getVars().src;
            });
            test.assertEquals(src, 'desktop-promo',
                              'Check desktop-promo src persists multi-hop');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA desktop promo click event', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        var trackingSlug;
        helpers.waitForPageLoaded(function() {
            test.assertExists('.desktop-promo');

            var itemSel = '.desktop-promo-item:first-child';
            trackingSlug = casper.evaluate(function(itemSel) {
                return $(itemSel).data('tracking');
            }, itemSel);

            casper.click('.desktop-promo-item:first-child');
        });

        casper.waitWhileSelector('[data-page-type~="homepage"]', function() {
            helpers.assertUASendEvent(test, [
                'View Desktop Promo Item',
                'click',
                trackingSlug
            ]);
        });

        helpers.done(test);
    }
});


casper.test.begin('Test UA desktop promo click event', {
    test: function(test) {
        helpers.startCasper({viewport: 'desktop'});

        var trackingSlug;
        helpers.waitForPageLoaded(function() {
            test.assertExists('.desktop-promo');

            var itemSel = '.desktop-promo-item:first-child';
            trackingSlug = casper.evaluate(function(itemSel) {
                return $(itemSel).data('tracking');
            }, itemSel);

            casper.click('.desktop-promo-item:first-child');
        });

        casper.waitWhileSelector('[data-page-type~="homepage"]', function() {
            helpers.assertUASendEvent(test, [
                'View Desktop Promo Item',
                'click',
                trackingSlug
            ]);
        });

        helpers.done(test);
    }
});
