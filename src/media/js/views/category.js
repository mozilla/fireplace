define('views/category',
    ['models', 'textoverflowclamp', 'tracking', 'underscore', 'urls', 'utils', 'z'],
    function(models, clamp, tracking, _, urls, utils, z) {
    'use strict';

    var cat_models = models('category');
    var app_models = models('app');

    return function(builder, args, params) {
        var category = args[0];
        params = params || {};

        var model = cat_models.lookup(category);
        var name = model && model.name;
        if (name) {
            builder.z('title', name);
        }

        builder.z('type', 'root');
        builder.z('show_cats', true);
        builder.z('cat', category);

        if ('src' in params) {
            delete params.src;
        }

        builder.start('category.html', {
            category: category,
            endpoint: urls.api.unsigned.url('category', [category], params),
            sort: params.sort,
            app_cast: app_models.cast
        }).done(function() {
            clamp(document.querySelector('.collection + .desc'), 7);
        });

        tracking.setPageVar(5, 'Category', category, 3);
    };
});
