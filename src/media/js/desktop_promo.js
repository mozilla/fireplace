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
                // Avoid using the number 8 since stylus doesn't agree with it.
                name: 'eighttracks',
                url: urls.reverse('app', ['8tracks']),
                text: gettext('Enjoy curated playlists from around the world.'),
            },
            {
                name: 'games',
                url: urls.reverse('feed_landing', ['collection',
                                                   'games-ent-appsdesktop']),
                text: gettext('Games & Entertainment Apps—Desktop Essentials'),
            },
            {
                name: 'pasjanssolitaire',
                url: urls.reverse('app', ['pasjanssolitaire']),
                text: gettext('Play multiple versions of the classic card game.'),
            },
            {
                name: 'productivity',
                url: urls.reverse('feed_landing', ['collection',
                                                   'productivity-appsdesktop']),
                text: gettext('Productivity Apps—Desktop Essentials'),
            },
            {
                name: 'pinterest',
                url: urls.reverse('app', ['pinterest']),
                text: gettext('Explore and catalog your favorite things on the web.'),
            },
        ].map(function(item) {
            item.url = utils.urlparams(item.url, {
                src: trackingEvents.SRCS.desktopPromo
            });
            return item;
        })
    };
});
