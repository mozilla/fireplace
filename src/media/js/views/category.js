define('views/category',
    ['categories', 'underscore', 'core/urls', 'core/utils', 'core/z'],
    function(categories, _, urls, utils, z) {
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

        builder.start('category.html', {
            category: slug,
            category_name: name,
            endpoint: urls.api.unsigned.url('category_landing', [slug], params),
            endpoint_name: 'category_landing',
            sort: params.sort,
        });

        require('tracking_events').trackCategoryHit(slug);
    };
});
