/*
    Checks for errors to display on start up.

    - System date is wrong.
    - No online connectivity.
*/
define('startup_errors',
    ['core/log', 'core/nunjucks', 'core/utils', 'core/z', 'utils_local'],
    function(log, nunjucks, utils, z, utilsLocal) {
    'use strict';
    var logger = log('startup_errors');

    if (!utils.isSystemDateRecent()) {
        // System date checking.
        z.body.addClass('error-overlaid')
            .append(nunjucks.env.render('errors/date-error.html'))
            .on('click', '.system-date .try-again', function() {
                if (utils.isSystemDateRecent()) {
                    window.location.reload();
                }
            });
    } else {
        utilsLocal.checkOnline().fail(function() {
            logger.log('Offline message');
            z.body.addClass('error-overlaid')
                .append(nunjucks.env.render('errors/offline-error.html'))
                .on('click', '.offline .try-again', function() {
                    logger.log('Re-checking online status');
                    utilsLocal.checkOnline().done(function(){
                        window.location.reload();
                     }).fail(function() {
                        logger.log('Still offline');
                    });
                });
        });
    }
});
