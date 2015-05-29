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
                name: 'esc-4-home',
                url: urls.reverse('app', ['esc-4-home']),
                // L10n: Esc 4 Home app desktop promo (bug 1166114).
                text: gettext('Escape from the worst boss ever.'),
            },
            {
                name: 'irccloud',
                url: urls.reverse('app', ['irccloud']),
                // L10n: IRCCloud app desktop promo (bug 1166114).
                text: gettext('Manage all your messages in one place.'),
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
                name: 'monster-wants-candy',
                url: urls.reverse('app', ['monster-wants-candy']),
                // L10n: Monster Wants Candy app desktop promo (bug 1166114).
                text: gettext('Save the girl, get the candy!'),
            },
        ].map(function(item) {
            item.url = utils.urlparams(item.url, {
                src: trackingEvents.SRCS.desktopPromo
            });
            return item;
        })
    };
});
