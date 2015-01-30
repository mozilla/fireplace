define('views/app',
    ['core/capabilities', 'content-ratings', 'core/l10n', 'core/log', 'core/settings', 'tracking',
     'core/utils', 'core/z'],
    function(caps, iarc, l10n, log, settings, tracking,
             utils, z) {
    'use strict';
    var gettext = l10n.gettext;
    var logger = log('app');

    z.page.on('click', '.truncate-toggle', utils._pd(function() {
        // Toggle description.
        var $this = $(this);
        $this.prev('.truncated-wrapper').toggleClass('truncated');
        $this.remove();
    }))

    .on('click', '.app-header .icon', utils._pd(function(e) {
        // When icon is clicked, append `#id=<id>` to the URL.
        window.location.hash = 'id=' + $('.product').data('id');
        e.stopPropagation();
    }));

    return function(builder, args) {
        builder.z('type', 'leaf detail');
        builder.z('title', gettext('Loading...'));

        var slug = args[0];
        builder.start('app/index.html', {
            iarc: iarc,
            placeholder_app: {
                author: gettext('Loading...'),
                name: gettext('Loading...'),
                previews: [{
                    image_url: '',
                    thumbnail_url: ''
                }],
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

        builder.onload('app-data', function(app) {
            // Called after app defer block is finished loading.
            builder.z('title', utils.translate(app.name));

            z.page.trigger('populatetray');

            $('.truncated-wrapper').each(function() {
                // 'truncated' class applied by default, remove if unneeded.
                var $this = $(this);
                if ($this.prop('scrollHeight') <= $this.prop('offsetHeight')) {
                    $this.removeClass('truncated').next('.truncate-toggle').hide();
                }
            });

            require('tracking_events').trackAppHit(app);
        });
    };
});
