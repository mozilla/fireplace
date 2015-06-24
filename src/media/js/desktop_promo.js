/*
    Content for the desktop promo carousel.
*/
define('desktop_promo',
    ['core/capabilities', 'core/l10n', 'core/urls', 'core/utils',
     'tracking_events'],
    function(caps, l10n, urls, utils, trackingEvents) {
    'use strict';
    var gettext = l10n.gettext;

    var newStrings = [
        // L10n: Chess game desktop promo (bug 1175381).
        gettext('Play 45 creative variations of chess.'),
        // L10n: Basecamp program desktop promo (bug 1175381).
        gettext('Manage projects easily with Basecamp.'),
        // L10n: GoldNuggets game desktop promo (bug 1175381).
        gettext('Play GoldNuggets now!'),
    ];


    return {
        isDesktop: function() {
            return caps.device_type() === 'desktop';
        },
        promoItems: [
            {
                name: 'maya',
                url: urls.reverse('app', ['maya']),
                // L10n: Maya app desktop promo (bug 1170850).
                text: gettext('Play this fantastic action puzzle game immediately.'),
            },
            {
                name: 'stitcher-radio',
                url: urls.reverse('app', ['stitcher-radio']),
                // L10n: Stitcher Radio app desktop promo (bug 1170850).
                text: gettext('Enjoy 15,000+ radio programs and podcasts.'),
            },
            {
                name: 'productivity',
                url: urls.reverse('feed_landing', ['collection',
                                                   'productivity-appsdesktop']),
                // L10n: Productivity collection desktop promo (bug 1108612).
                text: gettext('Productivity Apps—Desktop Essentials'),
            },
            {
                name: 'games',
                url: urls.reverse('feed_landing', ['collection',
                                                   'games-ent-appsdesktop']),
                // L10n: Games & Entertainment collection desktop promo (bug 1108612).
                text: gettext('Games & Entertainment Apps—Desktop Essentials'),
            },
            {
                name: 'zombie-getaway',
                url: urls.reverse('app', ['zombie-getaway']),
                // L10n: Zombie Getaway app desktop promo (bug 1170850).
                text: gettext('Run for your life!'),
            },
        ].map(function(item) {
            item.url = utils.urlparams(item.url, {
                src: trackingEvents.SRCS.desktopPromo
            });
            return item;
        })
    };
});
