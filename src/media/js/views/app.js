define('views/app',
    ['content-ratings', 'l10n', 'log', 'settings', 'overflow', 'tracking',
     'utils', 'z'],
    function(iarc, l10n, log, settings, overflow, tracking,
             utils, z) {
    'use strict';
    var gettext = l10n.gettext;
    var logger = log('app');

    z.page.on('click', '#product-rating-status .toggle', utils._pd(function() {
        // Toggle scary content rating disclaimers to developers.
        $(this).closest('.toggle').siblings('div').toggleClass('hidden');

    })).on('click', '.show-toggle', utils._pd(function() {
        var $this = $(this),
            newTxt = $this.attr('data-toggle-text');
        // Toggle "more..." or "less..." text.
        $this.attr('data-toggle-text', $this.text());
        $this.text(newTxt);
        // Toggle description.
        $this.prev('.truncated-wrapper').toggleClass('truncated');

    })).on('click', '.approval-pitch', utils._pd(function() {
        $('#preapproval-shortcut').trigger('submit');

    })).on('click', '.product-details .icon', utils._pd(function(e) {
        // When icon is clicked, append `#id=<id>` to the URL.
        window.location.hash = 'id=' + $('.product').data('id');
        e.stopPropagation();
    }));

    return function(builder, args) {
        builder.z('type', 'leaf detail');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('App Details'));

        var slug = args[0];
        builder.start('detail/main.html', {
            iarc: iarc,
            slug: slug
        });

        z.page.one('fragment_load_failed', function(e, data) {
            // Can be fragments errs for each defer block. Listen to first one.
            if (data.signature.id === 'app-data') {
                builder.z('title', gettext('Oh no!'));
            }
        });

        // tracking_events depends on navigation > views > views/app
        // Prevents a dep loop, but deps resolved by now.
        require('tracking_events').track_search_term(true);

        var sync = true;
        builder.onload('app-data', function(app) {
            builder.z('title', utils.translate(app.name));

            z.page.trigger('populatetray');
            overflow.init();

            $('.truncated-wrapper').each(function() {
                // 'truncated' class applied by default, remove if not needed.
                var $this = $(this);
                if ($this.prop('scrollHeight') <= $this.prop('offsetHeight')) {
                    $this.removeClass('truncated').next('.show-toggle').hide();
                }
            });

            if (!sync) {
                return;
            }

            if (app) {
                tracking.setPageVar(6, 'App name', app.name, 3);
                tracking.setPageVar(7, 'App ID', app.id + '', 3);
                tracking.setPageVar(8, 'App developer', app.author, 3);
                tracking.setPageVar(9, 'App view source', utils.getVars().src || 'direct', 3);
            } else {
                logger.warn('App object is falsey and is not being tracked');
            }

        }).onload('ratings', function() {
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
