define('views/category',
    ['categories', 'core/format', 'core/urls', 'core/utils', 'core/z',
     'underscore', 'tracking_events'],
    function(categories, format, urls, utils, z,
             _, trackingEvents) {
    'use strict';

    return function(builder, args, params) {
        params = params || {};
        var slug = args[0];
        var category = _.findWhere(categories, {slug: slug});
        var name = category ? category.name : '';
        if (name) {
            builder.z('title', name);
        }

        builder.z('type', 'leaf');
        builder.z('show_cats', true);
        builder.z('cat', slug);

        if ('src' in params) {
            delete params.src;
        }

        var popularSrc = format.format(trackingEvents.SRCS.categoryPopular,
                                       slug);
        var newSrc = format.format(trackingEvents.SRCS.categoryNew, slug);

        builder.start('category.html', {
            category: slug,
            category_name: name,
            endpoint: urls.api.unsigned.url('category', [slug], params),
            popularUrl: utils.urlparams(urls.reverse('category', [slug]), {
                src: popularSrc
            }),
            newUrl: utils.urlparams(urls.reverse('category', [slug]), {
                sort: 'reviewed',
                src: newSrc
            }),
            sort: params.sort,
            source: params.sort ? newSrc: popularSrc,
        });

        trackingEvents.trackCategoryHit(slug);
    };
});
