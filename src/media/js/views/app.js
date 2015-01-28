define('views/app',
    ['capabilities', 'content-ratings', 'l10n', 'log', 'overflow', 'settings',
     'tracking', 'utils', 'z'],
    function(caps, iarc, l10n, log, overflow, settings,
             tracking, utils, z) {
    'use strict';
    var gettext = l10n.gettext;
    var logger = log('app');

    z.page.on('click', '#product-rating-status .toggle', utils._pd(function() {
        // Toggle scary content rating disclaimers to developers.
        $(this).closest('.toggle').siblings('div').toggleClass('hidden');

    })).on('click', '.truncate-toggle', utils._pd(function() {
        var $this = $(this);
        // Toggle description.
        $this.prev('.truncated-wrapper').toggleClass('truncated');
        $this.remove();

    })).on('click', '.approval-pitch', utils._pd(function() {
        $('#preapproval-shortcut').trigger('submit');

    })).on('click', '.app-header .icon', utils._pd(function(e) {
        // When icon is clicked, append `#id=<id>` to the URL.
        window.location.hash = 'id=' + $('.product').data('id');
        e.stopPropagation();
    }));

    return function(builder, args) {
        builder.z('type', 'leaf detail');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('App Details'));

        var slug = args[0];
        builder.start('app/index.html', {
            iarc: iarc,
            placeholder_app: {
                author: gettext('Loading...'),
                name: gettext('Loading...'),
                price: gettext('Loading...'),
                price_locale: gettext('Loading...'),
                ratings: {
                    average: 0,
                    count: 0
                },
                slug: 'loading',
            },
            slug: slug
        });

        z.page.one('fragment_load_failed', function(e, data) {
            // Can be fragments errs for each defer block. Listen to first one.
            if (data.signature.id === 'app-data') {
                builder.z('title', gettext('Oh no!'));
            }
        });

        // tracking_events requires navigation > views > views/app
        // All deps should have been resolved by the time this executes.
        require('tracking_events').track_search_term(true);

        var sync = true;
        builder.onload('app-data', function(app) {
            /* Called after app defer block is finished loading. */
            builder.z('title', utils.translate(app.name));

            z.page.trigger('populatetray');
            overflow.init();

            $('.truncated-wrapper').each(function() {
                // 'truncated' class applied by default, remove if unneeded.
                var $this = $(this);
                if ($this.prop('scrollHeight') <= $this.prop('offsetHeight')) {
                    $this.removeClass('truncated').next('.truncate-toggle').hide();
                }
            });

            if (!sync) {
                return;
            }

            if (app) {
                tracking.setPageVar(6, 'App name', app.name, 3);
                tracking.setPageVar(7, 'App ID', app.id + '', 3);
                tracking.setPageVar(8, 'App developer', app.author, 3);
                tracking.setPageVar(9, 'App view source',
                                    utils.getVars().src || 'direct', 3);
                tracking.setPageVar(10, 'App price',
                                    app.payment_required ? 'paid' : 'free', 3);
            } else {
                logger.warn('App object is falsey and is not being tracked');
            }
        })

        .onload('ratings', function() {
            /* Called after ratings defer block is finished loading. */
            var reviews = $('.detail .reviews li');
            if (reviews.length >= 3) {
                for (var i = 0; i < reviews.length - 2; i += 2) {
                    var hgt = Math.max(reviews.eq(i).find('.review-inner').height(),
                                       reviews.eq(i + 1).find('.review-inner').height());
                    reviews.eq(i).find('.review-inner').height(hgt);
                    reviews.eq(i + 1).find('.review-inner').height(hgt);
                }
            }
        });

        sync = false;
    };
});
