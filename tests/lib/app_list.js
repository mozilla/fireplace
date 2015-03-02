/*
    Helper functions related to app lists.
    Prominently used in app_list.js and search.js tests.
*/
var constants = require('./constants');

function appNthChild(n) {
    return '.app-list-app:nth-child(' + n + ')';
}

function waitForAppListPage(appListPage, cb, opts) {
    helpers.startCasper(_.extend({path: appListPage.path}, opts || {}));
    if (appListPage.login) {
        helpers.waitForPageLoaded(function() {
            helpers.fake_login();
        });
        helpers.waitForLoggedIn();
    }
    casper.waitUntilVisible('.app-list', cb);
}

function waitForLoadMore(cb) {
    return casper.waitUntilVisible('.loadmore .button', function() {
        casper.click('.loadmore .button');
        casper.waitUntilVisible(appNthChild(constants.APP_LIMIT_LOADMORE), cb);
    });
}


function getAppData(installBtnSel) {
    // Return app data given its install button.
    var app = casper.evaluate(function(installBtnSel) {
        return $(installBtnSel).data('product');
    }, installBtnSel);
    app.UALabel = app.name + ':' + app.id;
    return app;
}


module.exports = {
    appNthChild: appNthChild,
    getAppData: getAppData,
    waitForAppListPage: waitForAppListPage,
    waitForLoadMore: waitForLoadMore,
};
