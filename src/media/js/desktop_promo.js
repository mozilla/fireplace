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
                name: 'evernote',
                url: urls.reverse('app', ['evernote-web']),
                text: gettext('Get organized with Evernote.'),
            },
            {
                name: 'sprint-club-nitro',
                url: urls.reverse('app', ['sprint-club-nitro']),
                text: gettext('Race across nine increasingly difficult levels.'),
            },
            {
                name: 'games',
                url: urls.reverse('feed_landing', ['collection',
                                                   'games-ent-appsdesktop']),
                text: gettext('Games & Entertainment Apps—Desktop Essentials'),
            },
            {
                name: 'productivity',
                url: urls.reverse('feed_landing', ['collection',
                                                   'productivity-appsdesktop']),
                text: gettext('Productivity Apps—Desktop Essentials'),
            },
            {
                name: 'cut-the-rope',
                url: urls.reverse('app', ['cut-the-rope']),
                text: gettext('Om Nom needs candy!'),
            },
        ].map(function(item) {
            item.url = utils.urlparams(item.url, {
                src: trackingEvents.SRCS.desktopPromo
            });
            return item;
        })
    };
});
