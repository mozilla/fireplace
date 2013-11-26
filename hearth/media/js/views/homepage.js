define('views/homepage',
    ['format', 'jquery', 'l10n', 'log', 'models', 'newsletter', 'textoverflowclamp', 'underscore', 'urls', 'utils'],
    function(format, $, l10n, log, models, newsletter, clamp, _, urls, utils) {
    'use strict';

    var gettext = l10n.gettext;
    var console = log('homepage');

    var app_models = models('app');

    var operatorInjected = false;
    var catElm = '<li><a class="cat-{0} cat-icon-a" data-cat-slug="{0}" href="{1}">{2}</a></li>';

    return function(builder, args, params) {
        params = params || {};

        builder.z('title', '');  // We don't want a title on the homepage.

        builder.z('type', 'root');
        builder.z('search', params.name);
        builder.z('title', params.name);

        builder.z('cat', 'all');
        builder.z('show_cats', true);

        if ('src' in params) {
            delete params.src;
        }

        builder.start('category/main.html', {
            endpoint: urls.api.url('category', [''], params),
            sort: params.sort,
            app_cast: app_models.cast
        }).done(function() {
            var shelf = builder.results['shelf'].operator;
            var $collections = $('.collection.main');
            newsletter.init();

            clamp(document.querySelector('.collection + .desc'), 7);

            if (!shelf.length) {
                console.log('OSC injection skipped; No shelf');
                return;
            }

            shelf = shelf[0];
            if (shelf.image && $collections.length === 2) {
                $collections.eq(1).closest('.placeholder').hide();
            }

            if (operatorInjected) {
                console.log('OSC injection skipped; Already injected');
                return;
            }

            if (!shelf.apps.length) return;

            // TODO: Remove this when things are different.
            // This lets the category for the OSC have a name and not just a slug.
            models('category').cast({
                name: shelf.name,
                slug: shelf.slug
            });

            // This is safe: cat-dropdown is required by marketplace.js.
            require('cat-dropdown').catrequest.done(function() {
                console.log('Injecting operator shelf into cat dropdown');
                var item = format.format(
                    catElm,
                    shelf.slug,
                    urls.reverse('collection', [shelf.slug]),
                    utils.translate(shelf.name)
                );

                // Inject op shelf to the category dropdown after "All Categories".
                $(item).insertAfter($('.cat-menu [data-cat-slug="all"]').closest('li'));
                operatorInjected = true;
            });
        });
    };
});
