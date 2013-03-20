define(
    ['capabilities', 'utils', 'z'],
    function(capabilities, utils, z) {

    var _pd = utils._pd;

    function initSelectedFilter() {
        var filters = utils.getVars();
    }

    z.page.on('click', '#filters .toggles a, .filters-bar a', _pd(function() {
        // Add 'sel' class to active filter and set hidden input value.
        var $elm = $(this);
        if ($elm.hasClass('cancel')) {
            return;
        }

        var $myUL = $elm.closest('ul');
        $myUL.find('a').removeClass('sel');
        $myUL.find('+ input[type=hidden]').val($elm.data('option'));
        $elm.addClass('sel');
    }));

    // Clear search field on 'cancel' search suggestions.
    $('#site-header').on('click', '.header-button.cancel', _pd(function() {
        $('#site-search-suggestions').trigger('dismiss');
        $('#search-q').val('');

    })).on('click', '.header-button, .search-clear', function(e) {
        var $this = $(this),
            $btns = $('.header-button');

        if ($this.hasClass('dismiss')) {
            // Dismiss looks like back but actually just dismisses an overlay.
            $('#filters').removeClass('show');
        } else if ($this.hasClass('filter')) {
            $('#filters').addClass('show');
        } else if ($this.hasClass('search-clear')) {
            $('#search-q').val('').focus();
        }
        e.preventDefault();
    });

    var expand = localStorage.getItem('expand-listings') === 'true' || capabilities.widescreen;
    function setTrays(expanded) {
        expand = expanded;
        $('ol.listing').toggleClass('expanded', expanded);
        $('.expand-toggle').toggleClass('active', expand);
        localStorage.setItem('expand-listings', expanded);
        if (expanded) {
            z.page.trigger('populatetray');
        }
    }

    z.body.on('click', '.expand-toggle', _pd(function() {
        setTrays(expand = !expand);
    }));

    z.page.on('loaded', function() {
        var $q = $('#search-q');
        $q.attr('placeholder', z.context.search || $q.data('placeholder-default'));
    }).on('reloaded_chrome', function() {
        setTrays(expand);
    }).on('loaded_more', function() {
        z.page.trigger('populatetray');
    });

    return function(builder, args, params) {
        _.extend(params, {page: 0});
        var is_category = 'cat' in params;

        if (!('sort' in params)) {
            params.sort = is_category ? 'popularity' : 'relevancy';
        }

        builder.z('type', 'search');
        builder.z('search', params.cat || params.q);
        builder.z('title', params.cat || params.q || gettext('Search Results'));

        builder.start('search/main.html', {params: params}).done(function() {
            setTrays(expand);
        });


        $('#filter-sort').find(is_category ? '.relevancy' : '.popularity').remove();
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
