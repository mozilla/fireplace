define('views/category_websites',
    ['categories', 'core/capabilities', 'core/format', 'core/settings',
     'core/urls', 'core/utils', 'core/z', 'underscore', 'tracking_events'],
    function(categories, caps, format, settings,
             urls, utils, z, _, trackingEvents) {
    'use strict';

    return function(builder, args, params) {
        params = params || {};
        var slug = decodeURIComponent(args[0]);
        var category = _.findWhere(categories, {slug: slug});
        var name = category ? category.name : '';
        if (name) {
            builder.z('title', name);
        }

        if (params.sort) {
            builder.z('type', 'root category app-list site-categories new nav-websites');
        } else {
            builder.z('type', 'root category app-list site-categories popular nav-websites');
        }
        builder.z('show_cats', true);
        builder.z('cat', slug);

        if ('src' in params) {
            delete params.src;
        }

        var popularSrc = format.format(trackingEvents.SRCS.categoryPopular,
                                       slug);
        var newSrc = format.format(trackingEvents.SRCS.categoryNew, slug);

        // Optimistically update the category dropdown.
        $('.header-categories-btn .cat-trigger').text(name);

        builder.start('category.html', {
            category: slug,
            category_name: name,
            categories: categories,
            endpoint: urls.api.unsigned.url('category_website', [slug], params),
            isWebsiteCategories: true,
            popularUrl: utils.urlparams(urls.reverse('category_websites', [slug]), {
                src: popularSrc
            }),
            newUrl: utils.urlparams(urls.reverse('category_websites', [slug]), {
                sort: 'reviewed',
                src: newSrc
            }),
            sort: params.sort,
            source: params.sort ? newSrc: popularSrc,
        });

        trackingEvents.trackCategoryHit(slug);
    };
});
