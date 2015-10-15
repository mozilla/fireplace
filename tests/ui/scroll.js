/*
    Test scroll states upon navigation.
*/
var appList = helpers.load('app_list');

function getScrollY() {
    return casper.evaluate(function() {
        return window.scrollY;
    });
}

function setScrollY(y) {
    return casper.evaluate(function(y) {
        window.scrollTo(0, y);
        return window.scrollY;
    }, y);
}

function scrollToAndClickApp(n) {
    // Click an nth app on an app list, returns the Y-position of the app.
    var appSelector = appList.appNthChild(n) + ' .mkt-tile';
    var scrollPos = setScrollY(casper.getElementBounds(appSelector).top);
    casper.click(appSelector);
    return scrollPos;
}

casper.test.begin('Test scroll state when hitting back on initial page', {
    test: function(test) {
        helpers.startCasper({path: '/app/appy'});

        helpers.waitForPageLoaded(function() {
            casper.click('.header-back-btn');
        });

        casper.waitWhileVisible('[data-page-type~="detail"]', function() {
            test.assertEquals(getScrollY(), 0, 'Check scroll is 0');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test scroll state set to 0 on navigate', {
    test: function(test) {
        helpers.startCasper({path: '/popular'});

        helpers.waitForPageLoaded(function() {
            scrollToAndClickApp(1);
        });

        helpers.waitForAppDetail(function() {
            test.assertEquals(getScrollY(), 0, 'Check scroll is 0');
        });

        helpers.done(test);
    }
});

casper.test.begin('Test scroll state preserved on pop', {
    test: function(test) {
        helpers.startCasper({path: '/popular'});

        var scrollPos;
        helpers.waitForPageLoaded(function() {
            scrollPos = scrollToAndClickApp(1);
        });

        helpers.waitForAppDetail(function() {
            casper.back();
        });

        helpers.waitForAppList(function() {
            test.assertEquals(getScrollY(), scrollPos,
                             'Check scroll preserved from before navigate');
            scrollPos = scrollToAndClickApp(15);
        });

        // Go again with another app to be sure.
        helpers.waitForAppDetail(function() {
            casper.back();
        });

        helpers.waitForAppList(function() {
            test.assertEquals(
                getScrollY(), scrollPos,
                'Check scroll preserved from before 2nd navigate');
        });

        helpers.done(test);
    }
});
