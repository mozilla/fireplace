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
            casper.waitUntilVisible('.app-list', cb);
        });
    } else {
        casper.waitUntilVisible('.app-list', cb);
    }
}

function waitForLoadMore(cb) {
    return casper.waitUntilVisible('.loadmore .button', function() {
        casper.click('.loadmore .button');
        casper.waitUntilVisible(appNthChild(constants.APP_LIMIT_LOADMORE), cb);
    });
}

module.exports = {
    appNthChild: appNthChild,
    waitForAppListPage: waitForAppListPage,
    waitForLoadMore: waitForLoadMore,
};
