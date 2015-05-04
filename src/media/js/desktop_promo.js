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
                text: gettext('Puzzle Games—Desktop Essentials'),
            },
            {
                name: 'littlealchemy',
                url: urls.reverse('app', ['littlealchemy']),
                text: gettext('Play the addicting game of elements.'),
            },
            {
                name: 'cut-the-rope',
                url: urls.reverse('app', ['cut-the-rope']),
                text: gettext('Om Nom needs candy!'),

            },
            {
                name: 'productivity',
                url: urls.reverse('feed_landing', ['collection',
                                                   'productivity-appsdesktop']),
                text: gettext('Productivity Apps—Desktop Essentials'),
            },
            {
                name: 'games',
                url: urls.reverse('feed_landing', ['collection',
                                                   'games-ent-appsdesktop']),
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
