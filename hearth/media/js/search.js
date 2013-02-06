define('search', ['capabilities', 'z'], function(capabilities, z) {
    function selectMe($elm) {
        var $myUL = $elm.closest('ul'),
            val = '',
            vars = getVars($elm[0].search);

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

    function initExpanded() {
        var storedExpand = localStorage.getItem('expand-listings');
        if (storedExpand === undefined) {
            expandListings = capabilities.desktop;
        } else {
            expandListings = storedExpand === 'true';
        }
    }

    function init() {
        z.page.on('click', 'b[data-href]', _pd(function(e) {
            e.stopPropagation();
            window.open($(this).data('href'), '_newtab');
        })).on('click', '#filters .toggles a, .filters-bar a', function() {
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
        }));

        z.doc.on('click', '#filters', function(e) {
            if ($(e.target).parent('#page').length) {
                $('#filters').removeClass('show');
            }
        });

        // Apply filters button.
        z.page.on('click', '#filters .apply', _pd(function() {
            $('#filters form').submit();
        }));

        // If we're on desktop, show graphical results - unless specified by user.
        var expandListings;

        var $expandToggle = $('#site-header .expand');

        // Toggle app listing graphical/compact view.
        $expandToggle.click(_pd(function(e) {
            expandListings = !expandListings;
            setTrays(expandListings);
        }));

        z.page.on('loaded', function() {
            if (z.body.data('page-type') === 'search') {
                initExpanded();
                setTrays(expandListings);
            }

            // Set "Category Name" or "Apps" as search placeholder.
            var $q = $('#search-q');
            $q.attr('placeholder', z.context.category || $q.data('placeholder-default'));
        });

        initExpanded();

        function setTrays(expanded) {
            $('ol.listing').toggleClass('expanded', expanded);
            $expandToggle.toggleClass('active', expanded);
            localStorage.setItem('expand-listings', expanded);
            if (expanded) {
                z.page.trigger('populatetray');
            }
        }
    }

    return {init: init};
});
