define('views/featured', ['urls', 'z'], function(urls, z) {

    return function(builder, args, __, params) {
        var category = args[0] || '';
        params = params || {};

        if (category === 'all' || category === undefined) {
            category = '';
        } else {
            builder.z('parent', urls.reverse('category', [category]));
        }

        builder.z('type', 'search');
        builder.z('search', params.name);
        builder.z('title', params.name || category);

        builder.start('featured.html', {
            category: category,
            endpoint: urls.api.unsigned.url('category', [category])
        });
    };

});
