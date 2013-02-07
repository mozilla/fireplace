define(['api', 'z', 'navigation', 'urls', 'utils'], function(api, z, nav, urls, utils) {

    var apiParams = api.params;
    var _pd = utils._pd;

    function selectMe($elm) {
        var $myUL = $elm.closest('ul'),
            val = '',
            vars = utils.getVars($elm[0].search);

        if ($elm.hasClass('cancel')) {
            return;
        }
        $myUL.find('a').removeClass('sel');

        if ($myUL[0].id == 'filter-prices') {
            val = vars.price || '';
        } else if ($myUL[0].id == 'filter-sort') {
            val = vars.sort || '';
        }
        $myUL.find('+ input[type=hidden]').val(val);
        $elm.addClass('sel');
    }

    function initSelectedFilter() {
        var sortoption = utils.getVars();

        $('#filter-sort li a').removeClass('sel');
        switch (sortoption.sort) {
            case 'None':
                $('#filter-sort li.relevancy a').addClass('sel');
                break;
            case 'popularity':
                $('#filter-sort li.popularity a').addClass('sel');
                break;
            case 'rating':
                $('#filter-sort li.rating a').addClass('sel');
                break;
            case '':
            case undefined:
                // If there's nothing selected, the first one is always the
                // default.
                $('#filter-sort li:first-child a').addClass('sel');
        }
    }

    z.page.on('click', '#filters .toggles a, .filters-bar a', function() {
        // Add 'sel' class to active filter and set hidden input value.
        var $this = $(this);
        selectMe($this);

        // On mobile the apply button will submit our form.
        // On desktop we'll follow the href.
        if ($this.closest('.toggles').length) {
            return false;
        }
    });

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
            // `getVars()` defaults to use location.search.
            initSelectedFilter();
            $('#filters').addClass('show');
        } else if ($this.hasClass('search')) {
            z.body.addClass('show-search');
            $btns.blur();
            $('#search-q').focus();
        } else if ($this.hasClass('cancel')) {
            z.body.removeClass('show-search');
            $('#search-q').blur();
            $btns.blur();
        } else if ($this.hasClass('search-clear')) {
            $('#search-q').val('').focus();
        }

        z.page.on('loaded', function() {
            // TODO: Is this being bound more than once?
            z.body.removeClass('show-search');
            $('#search-q').blur();
        });
        e.preventDefault();
    });

    function setTrays(expanded) {
        $('ol.listing').toggleClass('expanded', expanded);
        localStorage.setItem('expand-listings', expanded);
        if (expanded) {
            z.page.trigger('populatetray');
        }
    }

    return function(builder, args, params) {
        builder.start('search/main.html');
        _.extend(params, {page: 0});

        var expandListings = false;
        var storedExpand = localStorage.getItem('expand-listings');
        if (storedExpand === undefined) {
            expandListings = capabilities.desktop;
        } else {
            expandListings = storedExpand === 'true';
        }

        var loaded = function(data) {
            if (data.pagination.has_more) {
                var results = $('#search-results ol');
                var button = $(nunjucks.env.getTemplate('search/more_button.html')
                                           .render(require('helpers')));
                button.on('click', _pd(function() {
                    var $this = $(this);
                    $this.remove();
                    params.page++;

                    builder.get(apiParams('search', params))
                        .append('#search-results ol',
                                'market_tile_li.html',
                                'apps')
                        .done(loaded);
                }));
                results.append(button);
            } else if (!data.apps.length) {
                $('#search-results').html(
                    nunjucks.env.getTemplate('search/no_results.html')
                                .render(require('helpers')));
            }
        };

        builder.get(apiParams('search', params))
            .parts([
                {dest: '#featured ol', template: 'search/creatured_app.html', pluck: 'creatured'},
                {dest: '#search-results ol', template: 'market_tile_li.html', pluck: 'apps'}
            ]
        ).done(loaded).then(function() {
            setTrays(expandListings);

            var $q = $('#search-q');
            $q.attr('placeholder', params.cat || $q.data('placeholder-default'));
        });

        // Handle expanded/collapsed view
        var $expandToggle = $('#site-header .expand');
        $expandToggle.click(_pd(function(e) {
            expandListings = !expandListings;
            $expandToggle.toggleClass('active', expandListings);
            setTrays(expandListings);
        }));

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
            nav.navigate(utils.urlparams(urls.reverse('search'), params));

        }));

        builder.z('type', 'search');
        builder.z('title', 'Search');  // No L10n for you!
    };

});
