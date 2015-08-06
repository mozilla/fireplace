var logger = require('./logger');
var messages = require('./messages');


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function install(navigator) {
    navigator = navigator || window.navigator;

    logger.log('Activity support?', !!navigator.mozSetMessageHandler);
    if (navigator.mozSetMessageHandler) {
        navigator.mozSetMessageHandler('activity', function(req) {
            logger.log('Activity name: ', req.source.name);
            logger.log('Activity data: ', JSON.stringify(req.source.data));
            var msg = {
                name: req.source.name || '',
                data: req.source.data || {}
            };
            if (msg.name === 'marketplace-openmobile-acl') {
                // For each activity expecting a returnValue (at the moment
                // only "marketplace-openmobile-acl", keep the request around,
                // generating an unique id. When we receive back a message
                // saying an activity is done, if the id matches one we have,
                // post the result back to the activity caller).
                msg.id = getRandomInt(0, 9007199254740991);
                messages.activitiesInProgress[msg.id] = req;
                logger.log('This activity needs to return, generated id: ', msg.id);
                // 'marketplace-openmobile-acl' also needs to wait on a
                // getFeature() promise before sending the activity message.
                if (typeof navigator.getFeature !== 'undefined') {
                    navigator.getFeature('acl.version').then(function(val) {
                        logger.log('Sending activity with acl.version: ', val);
                        msg.data.acl_version = val;
                        messages.queueMessage(msg);
                    });
                }
                // Don't bother sending this one if getFeature() is absent.
                return;
            }
            messages.queueMessage(msg);
        });
    }
}

module.exports = {
    install: install,
};
