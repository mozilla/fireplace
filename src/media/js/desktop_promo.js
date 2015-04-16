/*
    Content for the desktop promo carousel.
*/
define('desktop_promo',
    ['core/capabilities', 'core/l10n', 'core/urls', 'core/utils',
     'tracking_events'],
    function(caps, l10n, urls, utils, trackingEvents) {
    'use strict';
    var gettext = l10n.gettext;

    // TODO: There is an ordering update, see bug 1155001#c0 for details.
    var nextPromoItems = [
        {
            name: 'evernote',
            url: urls.reverse('app', ['evernote-web']),
            text: gettext('Get organized with Evernote.'),
        },
        {
            name: 'cut-the-rope',
            url: urls.reverse('app', ['cut-the-rope']),
            text: gettext('Om Nom needs candy!'),
        },
        {
            name: 'sprint-club-nitro',
            url: urls.reverse('app', ['sprint-club-nitro']),
            text: gettext('Race across nine increasingly difficult levels.'),
        },
    ];

    return {
        isDesktop: function() {
            return caps.device_type() === 'desktop';
        },
        promoItems: [
            {
                name: 'zirma',
                url: urls.reverse('app', ['zirma']),
                text: gettext('Build, explore, and fight to become the ruler of Zirma.'),
            },
            {
                name: 'games',
                url: urls.reverse('feed_landing', ['collection',
                                                   'games-ent-appsdesktop']),
                text: gettext('Games & Entertainment Apps—Desktop Essentials'),
            },
            {
                name: 'outlook',
                url: urls.reverse('app', ['outlook-com']),
                text: gettext('Access Outlook from anywhere.'),
            },
            {
                name: 'productivity',
                url: urls.reverse('feed_landing', ['collection',
                                                   'productivity-appsdesktop']),
                text: gettext('Productivity Apps—Desktop Essentials'),
            },
            {
                name: 'yelp',
                url: urls.reverse('app', ['yelp']),
                text: gettext('Find everything—from shoes to sushi.'),
            },
        ].map(function(item) {
            item.url = utils.urlparams(item.url, {
                src: trackingEvents.SRCS.desktopPromo
            });
            return item;
        })
    };
});
