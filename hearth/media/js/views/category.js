define('views/category',
    ['capabilities', 'underscore', 'urls', 'utils', 'z'],
    function(capabilities, _, urls, utils, z) {
    'use strict';

    return function(builder, args, params) {
        var category = args[0];
        _.defaults(params || {}, {sort: 'popularity'});

        builder.z('type', 'root');
        builder.z('search', params.name || category);
        builder.z('title', params.name || category);

        builder.start('category/main.html', {
            category: category,
            category_name: category,
            endpoint: urls.api.url('category', [category]),
            sort: params.sort
        }).done(function() {setTrays();});
    };
});
