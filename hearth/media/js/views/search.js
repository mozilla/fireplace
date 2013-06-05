define('views/search',
    ['capabilities', 'l10n', 'storage', 'tracking', 'underscore', 'urls', 'utils', 'z'],
    function(capabilities, l10n, storage, tracking, _, urls, utils, z) {

    var _pd = utils._pd;
    var gettext = l10n.gettext;
    var ngettext = l10n.ngettext;

    // Clear search field on 'cancel' search suggestions.
    $('#site-header').on('click', '.header-button.cancel', _pd(function() {
        $('#site-search-suggestions').trigger('dismiss');
        $('#search-q').val('');

    })).on('click', '.header-button, .search-clear', _pd(function(e) {
        var $this = $(this),
            $btns = $('.header-button');

        if ($this.hasClass('search-clear')) {
            $('#search-q').val('').focus();
        }
    }));

    // Default to the graphical view at desktop widths and traditional
    // list view at lesser widths.
    var expand = capabilities.widescreen();
    if ('expand-listings' in storage) {
        // If we've set this value in localStorage before, then use it.
        expand = storage['expand-listings'] === 'true';
    }

    function setTrays(expanded) {
        if (expanded !== undefined) {
            expand = expanded;
        }
        $('ol.listing').toggleClass('expanded', expanded);
        $('.expand-toggle').toggleClass('active', expand);
        storage.setItem('expand-listings', expanded);
        if (expanded) {
            z.page.trigger('populatetray');
        }
    }

    function parsePotatoSearch(query) {
        // This handles PotatoSearch queries:
        // https://github.com/mozilla/fireplace/wiki/QuickSearch-(PotatoSearch%E2%84%A2)

        query = query || {};

        // We keep track of the full query separately, since we don't want
        // to send it as `q` to the API.
        query.full_q = query.q || '';
        query.q = [];

        query.full_q.split(' ').forEach(function(value) {
            if (value[0] === ':') {
                value = value.slice(1);
                if (value === 'packaged' || value === 'hosted') {
                    query.app_type = value;
                } else if (value === 'free' || value === 'free-inapp') {
                    query.premium_types = value;
                } else if (value === 'premium' || value === 'paid') {
                    query.premium_types = 'premium';
                } else if (value === 'premium-inapp' || value === 'paid-inapp') {
                    query.premium_types = 'premium-inapp';
                } else if (value === 'premium-other' || value === 'paid-other') {
                    query.premium_types = 'premium-other';
                } else if (value.indexOf('cat-') === 0) {
                    query.cat = value.slice(4);
                }
            } else {
                // Include anything that's not a keyword in the `q` search term.
                query.q.push(value);
            }
        });

        query.q = query.q.join(' ');  // This is what gets sent to the API.

        // There were no keywords, so remove full_q.
        if (query.q === query.full_q) {
            delete query.full_q;
        }

        return query;
    }

    z.body.on('click', '.expand-toggle', _pd(function() {
        setTrays(expand = !expand);

        tracking.trackEvent(
            'View type interactions',
            'click',
            expand ? 'Expanded view' : 'List view'
        );
    })).on('submit', 'form#search', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var $q = $('#search-q');
        var query = $q.val();
        if (query === 'do a barrel roll') {
            z.body.toggleClass('roll');
        } else if (query === ':debug') {
            z.page.trigger('navigate', urls.reverse('debug'));
            return;
        }
        $q.blur();
        z.page.trigger('search', parsePotatoSearch({q: query}));
    });

    z.page.on('loaded', function() {
        var $q = $('#search-q');
        $q.val(z.context.search);
        // If this is a search results or "my apps" page.
        if ($('#search-results').length || $('#account-settings .listing').length) {
            setTrays(expand);
        }
    }).on('reloaded_chrome', function() {
        setTrays(expand);
    }).on('loaded_more', function() {
        z.page.trigger('populatetray');
        // Update "Showing 1—{total}" text.
        z.page.find('.total-results').text(z.page.find('.item.app').length);
    }).on('search', function(e, params) {
        e.preventDefault();
        return z.page.trigger(
            'navigate', utils.urlparams(urls.reverse('search'), params));
    });

    return function(builder, args, params) {
        if ('sort' in params && params.sort == 'relevancy') {
            delete params.sort;
        }

        builder.z('type', 'search');
        builder.z('search', params.full_q || params.q);
        builder.z('title', params.q || params.full_q || gettext('Search Results'));

        builder.start(
            'search/main.html',
            {params: _.extend({}, params)}
        );
    };

});
