define(
    ['capabilities', 'utils', 'z'],
    function(capabilities, utils, z) {

    var _pd = utils._pd;

    return function(builder, args, __, params) {
        var category = args[0];
        _.extend(params, {page: 0});

        if (!('sort' in params)) {
            params.sort = 'popularity';
        }

        builder.z('type', 'search');
        builder.z('search', params.name || category);
        builder.z('title', params.name || category);

        builder.start('category/main.html', {category: category})
               .done(function() {setTrays();});

        $('#filter-sort li:first a').each(function(i, e) {
            var $this = $(e);
            $this.toggleClass('sel', params.sort == $this.data('option'));
        });

        // Handle filtering
        $('#filters .apply').on('click', _pd(function () {
            $('#filters').removeClass('show');
            $('#filters .params').each(function (i, e) {
                var $this = $(e);
                var val = $this.val();
                if (val) {
                    params[$this.attr('name')] = val;
                }
            });

            delete params['page'];
            z.page.trigger('search', params);

        }));
    };

});
