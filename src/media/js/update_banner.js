/*
    A module that checks for updates for the Marketplace app if we are inside
    the iframed or packaged app, and that shows a banner to the user if an
    update is available.
*/
define('update_banner',
    ['apps', 'core/capabilities', 'jquery', 'core/l10n', 'core/log',
     'core/nunjucks', 'core/settings', 'core/utils', 'core/z'],
    function(apps, capabilities, $, l10n, log, nunjucks, settings, utils, z) {

    var logger = log('update_banner');
    var gettext = l10n.gettext;
    var manifestURL = settings.manifest_url;
    var selector = '#marketplace-update-banner';

    z.body.on('click', selector + ' .download-button', utils._pd(function() {
        var $button = $(this);
        // Deactivate "remember" on the dismiss button so that it'll show up
        // for the next update if the user clicks on it now that they chose to
        // apply the update.
        $button.closest('mkt-banner').get(0).dismiss = '';
        $button.addClass('spin');
        apps.applyUpdate(manifestURL).done(function() {
            $(selector + ' span').text(gettext(
                'The next time you start the Firefox Marketplace app, you’ll see the updated version!'));
            $button.remove();
        });
    }));

    function showIfNeeded() {
        apps.promise.then(function() {
            // The banner should only be shown from inside an app (and not just
            // when browsing the website, for instance). Since we want this to
            // work from inside the iframe code, we can't use getSelf()...
            // Instead, we use the manifest_url (which needs to be hardcoded in
            // settings).
            if (capabilities.webApps &&
                    manifestURL &&
                    (capabilities.packaged || capabilities.iframed)) {

                apps.checkForUpdate(manifestURL).done(function(result) {
                    if (result && $(selector).length === 0) {
                        logger.log('Update found, inserting banner.');
                        $('.banners').append(
                            nunjucks.env.render('marketplace-update.html'));
                    } else {
                        logger.log('No update found.');
                    }
                });
            } else {
                logger.log('Skipping update check.');
            }
        });
    }

    return {
        showIfNeeded: showIfNeeded
    };
});
