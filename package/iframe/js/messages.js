var logger = require('./logger');


var activitiesInProgress = {};
var activitiesToSend = [];

function postMessage(msg) {
    logger.log('postMessaging to ' + process.env.MKT_URL + ': ' + JSON.stringify(msg));
    document.querySelector('iframe').contentWindow.postMessage(msg, process.env.MKT_URL);
}

function sendActivities() {
    logger.log('Sending activities: ' + JSON.stringify(activitiesToSend));
    while (activitiesToSend.length) {
        postMessage(activitiesToSend.pop());
    }
    // The next time we try to append something to `activitiesToSend`,
    // we'll have already called this function (`sendActivities`)
    // so just postMessage the message (`msg`) immediately.
    activitiesToSend = {
        push: function(msg) {
            postMessage(msg);
        }
    };
}

function queueMessage(msg) {
    activitiesToSend.push(msg);
}

function install() {
    window.addEventListener('message', function(e) {
        // Receive postMessage from the iframe contents and do something with it.
        logger.log('Handled post message from ' + e.origin + ': ' + JSON.stringify(e.data));
        if (e.origin !== process.env.MKT_URL) {
            logger.log('Ignored post message from ' + e.origin + ': ' + JSON.stringify(e.data));
            return;
        }
        if (e.data === 'loaded') {
            logger.log('Preparing to send activities ...');
            sendActivities();
        } else if (e.data.type === 'fxa-watch') {
            logger.log('Registering FxA callbacks');
            navigator.mozId.watch({
                wantIssuer: 'firefox-accounts',
                loggedInUser: e.data.email,
                onready: function() {},
                onlogin: function(a) {logger.log('fxa-login'); postMessage({type: 'fxa-login', assertion: a});},
                onlogout: function() {logger.log('fxa-logout'); postMessage({type: 'fxa-logout'});}
            });
        } else if (e.data.type === 'fxa-request') {
            navigator.mozId.request({oncancel: function(){postMessage({type: 'fxa-cancel'});}});
        } else if (e.data.type == 'activity-result' && e.data.id && activitiesInProgress[e.data.id]) {
            logger.log('Posting back result for activity id:', e.data.id);
            activitiesInProgress[e.data.id].postResult(e.data.result);
            delete activitiesInProgress[e.data.id];
        } else if (e.data.type == 'activity-error' && e.data.id && activitiesInProgress[e.data.id]) {
            logger.log('Posting back error for activity id:', e.data.id);
            activitiesInProgress[e.data.id].postError(e.data.result);
            delete activitiesInProgress[e.data.id];
        }
    }, false);
}

module.exports = {
    activitiesInProgress: activitiesInProgress,
    install: install,
    queueMessage: queueMessage,
};
