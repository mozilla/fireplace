define('views/homepage',
    ['jquery', 'capabilities', 'format', 'l10n', 'log', 'mkt-carousel',
     'nunjucks', 'requests', 'salvattore', 'urls', 'utils', 'utils_local',
     'z'],
    function($, capabilities, format, l10n, log, mktCarousel,
             nunjucks, requests, salvattore, urls, utils, utils_local,
             z) {
    'use strict';
    var logger = log('homepage');
    var gettext = l10n.gettext;

    z.page.on('click', '.loadmore.feed-item-item button', function() {
        // Manually handle pagination to insert elements into Salvattore.
        // Be careful with above selector to target the homepage only.
        var $btn = $(this);
        var $loadmore = $btn.parent();
        var $btn_clone = $loadmore.clone();
        $btn.remove();

        requests.get($btn.data('url')).done(function(data) {
            $loadmore.remove();

            // Transform the data into elements.
            var elements = data.objects.map(function(item) {
                return $(nunjucks.env.render('feed/feed_item.html',
                                             {item: item}))[0];
            });

            // Insert elements with Salvattore.
            var homeFeed = document.querySelector('.home-feed');
            if (homeFeed) {
                salvattore.append_elements(homeFeed, elements);
            }

            // Render another loadmore button.
            if (data.meta.next) {
                $btn_clone.find('button').attr('data-url',
                    urls.api.base.host(data.meta.next) + data.meta.next);
                homeFeed.parentNode.insertBefore($btn_clone[0], homeFeed.nextSibling);
            }

            z.page.trigger('fragment_loaded');
        });
    });

    return function(builder, args, params) {
        params = params || {};

        builder.z('title', '');
        builder.z('type', 'root homepage');

        if ('src' in params) {
            delete params.src;
        }

        var isDesktop = capabilities.device_type() === 'desktop';
        var promoItems = [
            {
                name: 'games',
                url: urls.reverse('feed/feed_collection', ['games-ent-appsdesktop']),
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
                url: urls.reverse('feed/feed_collection', ['productivity-appsdesktop']),
                text: gettext('Productivity Apps—Desktop Essentials'),
            },
            {
                name: 'box',
                url: urls.reverse('app', ['box']),
                text: gettext('Store and share any type of file with Box.'),
            },
        ] .map(function (item) {
          item.url = utils.urlparams(item.url, {src: 'desktop-promo'});
          return item;
        });

        builder.start('feed.html', {showPromo: isDesktop, promoItems: promoItems});

        if (isDesktop) {
            mktCarousel.initialize();
        }

        builder.onload('feed-items', function(data) {
            utils_local.initSalvattore(document.querySelector('.home-feed'));
        });
    };
});
