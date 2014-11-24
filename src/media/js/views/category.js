define('views/category',
    ['categories', 'models', 'tracking', 'underscore', 'urls', 'utils', 'z'],
    function(categories, models, tracking, _, urls, utils, z) {
    'use strict';

    var app_models = models('app');

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
            app_cast: app_models.cast
        });

        tracking.setPageVar(5, 'Category', slug, 3);
    };
});
