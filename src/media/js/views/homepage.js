define('views/homepage',
    ['require', 'jquery', 'isotope', 'format', 'l10n', 'log', 'newsletter',
     'nunjucks', 'requests', 'underscore', 'urls', 'utils', 'z'],
    function(require, $, Isotope, format, l10n, log, newsletter,
             nunjucks, requests, _, urls, utils, z) {
    'use strict';
    var console = log('homepage');
    var gettext = l10n.gettext;

    z.page.on('click', '.loadmore button', function() {
        // Manually handle pagination in order to properly insert elements into
        // Isotope's layout.
        var $btn = $(this);
        var $loadmore = $btn.parent();
        var $btn_clone = $loadmore.clone();  // In case we have another page.
        $btn.remove();

        requests.get($btn.data('url')).done(function(data) {
            $loadmore.remove();

            require(['jquery-bridget/jquery.bridget'], function() {
                // Use bridget to make Isotope a jQuery plugin.
                // http://isotope.metafizzy.co/appendix.html#requirejs
                $.bridget('isotope', Isotope);

                // Insert via Isotope.
                var elements = _.map(data.objects, function(item) {
                    return $(nunjucks.env.render('feed/feed_item.html', {item: item}))[0];
                });

                // Render another loadmore button.
                if (data.meta.next) {
                    $btn_clone.find('button').attr('data-url',
                        urls.api.base.host(data.meta.next) + data.meta.next);
                    elements.push($btn_clone[0]);
                }

                $('ul.feed').isotope('insert', elements);
                z.page.trigger('fragment_loaded');
            });
        });
    });

    return function(builder, args, params) {
        params = params || {};

        builder.z('title', '');
        builder.z('type', 'root homepage');

        if ('src' in params) {
            delete params.src;
        }

        builder.start('feed.html', {});

        builder.onload('feed-items', function() {
            var $feed = $('.feed');

            require(['jquery-bridget/jquery.bridget'], function() {
                // Use bridget to make Isotope a jQuery plugin.
                // http://isotope.metafizzy.co/appendix.html#requirejs
                $.bridget('isotope', Isotope);
                $feed.isotope({
                    itemSelector: '.feed-item-item',
                    layoutMode: 'masonry',
                    masonry: {
                        columnWidth: 300,
                        gutter: 18,
                        isFitWidth: false
                    }
                });
                z.page.trigger('fragment_loaded');

                $feed.css('opacity', 1);  // Fade-in to hide the Isotope reflow.
            });
        });
    };
});
