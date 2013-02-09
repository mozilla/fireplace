define(['api', 'z', 'navigation', 'urls', 'utils'], function(api, z, nav, urls, utils) {

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
        var is_category = 'cat' in params;

        if (!('sort' in params)) {
            params.sort = is_category ? 'popularity' : 'relevancy';
        }
        $('#filter-sort').find(is_category ? '.relevancy' : '.popularity').remove();
        $('#filter-sort li:first a').each(function(i, e) {
            var $this = $(e);
            $this.toggleClass('sel', params.sort == $this.data('option'));
        });


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
                    $this.addClass('loading');
                    $this.append('<div class="throbber">');
                    params.page++;

                    builder.get(api.params('search', params))
                        .append('#search-results ol', 'search/result.html', 'apps')
                        .done(function() {$this.remove();})
                        .done(loaded);
                }));
                results.append(button);
            } else if (!data.apps.length) {
                $('#search-results').html(
                    nunjucks.env.getTemplate('search/no_results.html')
                                .render(require('helpers')));
            }
        };

        builder.get(api.params('search', params))
            .parts([
                {dest: '#featured ol', template: 'search/creatured_app.html', pluck: 'creatured'},
                {dest: '#search-results ol', template: 'search/result.html', pluck: 'apps'}
            ]
        ).done(loaded).then(function() {
            setTrays(expandListings);

            console.log('loaded');
            var $q = $('#search-q');
            $q.attr('placeholder', z.context.title || $q.data('placeholder-default'));
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
        builder.z('title', params.cat || params.q);  // No L10n for you!
    };

});
