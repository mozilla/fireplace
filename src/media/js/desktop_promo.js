/*
    Content for the desktop promo carousel.
*/
define('desktop_promo',
    ['core/capabilities', 'core/l10n', 'core/urls', 'core/utils',],
    function(caps, l10n, urls, utils) {
    'use strict';
    var gettext = l10n.gettext;

    return {
        isDesktop: function() {
            return caps.device_type() === 'desktop';
        },
        promoItems: [
            {
                name: 'games',
                url: urls.reverse('feed_landing', ['collection',
                                                   'games-ent-appsdesktop']),
                text: gettext('Games & Entertainment Apps—Desktop Essentials'),
            },
            {
                name: 'soundcloud',
                url: urls.reverse('app', ['soundcloud']),
                text: gettext('Discover, share, and enjoy music with SoundCloud.'),
            },
            {
                name: 'hexrace',
                url: urls.reverse('app', ['hexgl-1']),
                text: gettext('Play Hex Race—a thrill ride from the future!'),
            },
            {
                name: 'productivity',
                url: urls.reverse('feed_landing', ['collection',
                                                   'productivity-appsdesktop']),
                text: gettext('Productivity Apps—Desktop Essentials'),
            },
            {
                name: 'box',
                url: urls.reverse('app', ['box']),
                text: gettext('Store and share any type of file with Box.'),
            },
        ].map(function(item) {
          item.url = utils.urlparams(item.url, {src: 'desktop-promo'});
          return item;
        })
    };
});
