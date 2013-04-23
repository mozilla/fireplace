define(
    ['capabilities', 'utils', 'z'],
    function(capabilities, utils, z) {

    var _pd = utils._pd;

    return function(builder, args, __, params) {
        var category = args[0];
        params = params || {};
        _.extend(params, {page: 0});

        if (!('sort' in params)) {
            params.sort = 'popularity';
        }

        builder.z('type', 'search');
        builder.z('search', params.name || category);
        builder.z('title', params.name || category);

        builder.start('category/main.html', {category: category})
               .done(function() {setTrays();});
    };

});
