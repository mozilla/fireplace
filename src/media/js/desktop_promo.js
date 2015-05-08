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
                name: 'puzzle-games',
                url: urls.reverse(
                    'feed_landing',
                    ['collection', 'puzzle-gamesdesktop-essentials']),
                // L10n: Puzzle Games collection desktop promo (bug 1160327).
                text: gettext('Puzzle Games—Desktop Essentials'),
            },
            {
                name: 'littlealchemy',
                url: urls.reverse('app', ['littlealchemy']),
                // L10n: Little Alchemy app desktop promo (bug 1160327).
                text: gettext('Play the addicting game of elements.'),
            },
            {
                name: 'cut-the-rope',
                url: urls.reverse('app', ['cut-the-rope']),
                // L10n: Cut the Rope app desktop promo (bug 1155001).
                text: gettext('Om Nom needs candy!'),
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
        ].map(function(item) {
            item.url = utils.urlparams(item.url, {
                src: trackingEvents.SRCS.desktopPromo
            });
            return item;
        })
    };
});
