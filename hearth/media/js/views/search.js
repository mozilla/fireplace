define(
    ['capabilities', 'l10n', 'utils', 'z'],
    function(capabilities, l10n, utils, z) {

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

    var expand = localStorage.getItem('expand-listings') === 'true' || capabilities.widescreen;
    function setTrays(expanded) {
        if (expanded !== undefined) {
            expand = expanded;
        }
        $('ol.listing').toggleClass('expanded', expanded);
        $('.expand-toggle').toggleClass('active', expand);
        localStorage.setItem('expand-listings', expanded);
        if (expanded) {
            z.page.trigger('populatetray');
        }
    }
    window.setTrays = setTrays; // TODO: this is less than ideal.

    z.body.on('click', '.expand-toggle', _pd(function() {
        setTrays(expand = !expand);
    }));

    z.page.on('loaded', function() {
        var $q = $('#search-q');
        $q.attr('placeholder', z.context.search || $q.data('placeholder-default'));
        $q.val(z.context.search);
        if (z.context.search) {
            $q.attr('data-context', '');
        } else {
            $q.removeAttr('data-context');
        }
    }).on('reloaded_chrome', function() {
        setTrays(expand);
    }).on('loaded_more', function() {
        z.page.trigger('populatetray');
    });

    return function(builder, args, params) {
        if ('sort' in params && params.sort == 'relevancy') {
            delete params.sort;
        }

        builder.z('type', 'search');
        builder.z('search', params.q);
        builder.z('title', params.q || gettext('Search Results'));

        builder.start('search/main.html', {params: _.extend({}, params)}).done(setTrays);
    };

});
