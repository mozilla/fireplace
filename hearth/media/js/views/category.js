define('views/category',
    ['capabilities', 'models', 'underscore', 'urls', 'utils', 'z'],
    function(capabilities, models, _, urls, utils, z) {
    'use strict';

    var cat_models = models('category');

    return function(builder, args, params) {
        var category = args[0];
        _.defaults(params || {}, {sort: 'popularity'});

        var model = cat_models.lookup(category);

        builder.z('type', 'root');
        builder.z('title', (model && model.name) || category);
        builder.z('show_cats', true);
        builder.z('cat', category);

        builder.start('category/main.html', {
            category: category,
            category_name: category,
            endpoint: urls.api.url('category', [category], {sort: params.sort}),
            sort: params.sort
        }).done(setTrays);
    };
});
