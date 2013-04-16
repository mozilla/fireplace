define(['z'], function(z) {

    return function(builder, args, __, params) {
        var category = args[0] || '';
        params = params || {};

        builder.z('type', 'search');
        builder.z('search', params.name || category);
        builder.z('title', params.name || category);

        builder.start('featured.html', {category: category}).done(setTrays);
    };

});
