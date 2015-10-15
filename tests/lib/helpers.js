/*
    This file contains local helpers for casper testing. The `helpers` global
    included in all UI test files is the result of merging this file onto the
    global helpers which are in marketplace-gulp/tests/casper-helpers.js.
*/

function assertUASendEvent(test, trackArgs) {
    // Check that a UA tracking event or variable change was made
    // by checking the tracking logs.
    // If trackArgs is a string, it will just check the first argument.
    if (trackArgs.constructor !== String) {
        trackArgs = ['send', 'event'].concat(trackArgs);
    }
    return assertUATrackingLog(test, trackArgs);
}


function assertUASetSessionVar(test, trackArgs) {
    if (trackArgs.constructor !== String) {
        trackArgs = ['set'].concat(trackArgs);
    }
    return assertUATrackingLog(test, trackArgs);
}


function assertUATrackingLog(test, trackArgs) {
    var trackExists = casper.evaluate(function(trackArgs) {
        var _ = window.require('underscore');
        var trackLog = window.require('tracking').trackLog;

        return trackLog.filter(function(log) {
            console.log(JSON.stringify(log));
            console.log(JSON.stringify(trackArgs));
            if (trackArgs.constructor === String) {
                // Just compare event name for convenience.
                return log[2] == trackArgs;
            }
            return _.isEqual(log, trackArgs);
        }).length !== 0;
    }, trackArgs);

    if (!trackExists) {
        console.log(JSON.stringify(trackArgs));
    }
    test.assert(trackExists, 'Tracking event exists');
}


var browser = {
    isPhantom: navigator.userAgent.toLowerCase().indexOf('phantom') > -1,
    isSlimer: navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
};


function filterUALogs(trackArgs) {
    // Given an array, filter UA log that matches the array.
    return casper.evaluate(function(trackArgs) {
        var _ = window.require('underscore');
        var trackLog = window.require('tracking').trackLog.reverse();

        return trackLog.filter(function(log) {
            return _.isEqual(log.slice(0, trackArgs.length), trackArgs);
        });
    }, trackArgs);
}


// TODO: Bring this back if a header title is added.
/*
function headerTitle() {
    return casper.fetchText('.mkt-header--title');
}
*/

function isLeafPage() {
    var pageTypes = casper.getElementAttribute('body', 'data-page-type')
                          .split(' ');
    return pageTypes.indexOf('leaf') !== -1;
}


function waitForAppDetail(cb) {
    casper.waitForSelector('[data-page-type~="detail"]', cb);
}


function waitForAppList(cb) {
    casper.waitForSelector('.app-list', cb);
}


function waitForFeedItem(cb) {
    casper.waitForSelector('.feed-item-item', cb);
}


module.exports = {
    assertUASendEvent: assertUASendEvent,
    assertUASetSessionVar: assertUASetSessionVar,
    browser: browser,
    filterUALogs: filterUALogs,
    //headerTitle: headerTitle,
    isLeafPage: isLeafPage,
    waitForAppDetail: waitForAppDetail,
    waitForAppList: waitForAppList,
    waitForFeedItem: waitForFeedItem,
};
