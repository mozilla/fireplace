/*
    Content for the desktop promo carousel.
*/
define('desktop_promo',
    ['core/capabilities', 'core/l10n', 'core/urls', 'core/utils',
     'tracking_events'],
    function(caps, l10n, urls, utils, trackingEvents) {
    'use strict';
    var gettext = l10n.gettext;

    return {
        isDesktop: function() {
            return caps.device_type() === 'desktop';
        },
        promoItems: [
            {
                name: 'chess-1',
                url: urls.reverse('app', ['chess-1']),
                // L10n: Chess game desktop promo (bug 1175381).
                text: gettext('Play 45 creative variations of chess.'),
            },
            {
                name: 'basecamp',
                url: urls.reverse('app', ['basecamp']),
                // L10n: Basecamp program desktop promo (bug 1175381).
                text: gettext('Manage projects easily with Basecamp.'),
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
                name: 'goldnuggets',
                url: urls.reverse('app', ['goldnuggets']),
                // L10n: GoldNuggets game desktop promo (bug 1175381).
                text: gettext('Play GoldNuggets now!'),
            },
        ].map(function(item) {
            item.url = utils.urlparams(item.url, {
                src: trackingEvents.SRCS.desktopPromo
            });
            return item;
        })
    };
});
