define('views/app',
    ['content-ratings', 'core/capabilities', 'core/l10n', 'core/log',
     'core/settings', 'core/utils', 'core/z', 'previews', 'tracking_events',
     'truncator', 'utils_local', 'views/app/abuse'],
    function(iarc, caps, l10n, log,
             settings, utils, z, previews, trackingEvents,
             truncator, utilsLocal, abuseView) {
    'use strict';
    var gettext = l10n.gettext;
    var logger = log('app');

    return function(builder, args) {
        truncator.init();

        builder.z('type', 'leaf detail spoke-header nav-apps');
        builder.z('title', gettext('Loading...'));
        utilsLocal.headerTitle(gettext('App Detail'));

        var slug = decodeURIComponent(args[0]);
        builder.start('app/index.html', {
            iarc: iarc,
            placeholder_app: {
                loading: true,
                author: gettext('Loading...'),
                name: gettext('Loading...'),
                previews: [{
                    image_url: '',
                    thumbnail_url: ''
                }],
                price: gettext('Loading...'),
                price_locale: gettext('Loading...'),
                ratings: {
                    average: 0,
                    count: 0
                },
                slug: 'loading',
            },
            slug: slug
        });

        // Make preview tray full width on desktop while loading.
        previews.resizeDesktopDetailTray();

        z.page.one('fragment_load_failed', function(e, data) {
            // Can be fragments errs for each defer block. Listen to first one.
            if (data.signature.id === 'app-data') {
                builder.z('title', gettext('Oh no!'));
            }
        });

        builder.onload('app-data', function(app) {
            // Called after app defer block is finished loading.
            builder.z('title', utils.translate(app.name));

            previews.initialize();
            previews.resizeDesktopDetailTray();

            truncator.removeUntruncated();

            trackingEvents.trackAppHit();
        });
    };
});
