define('app_list',
    ['capabilities', 'storage', 'tracking', 'utils', 'z'],
    function(caps, storage, tracking, utils, z) {
    'use strict';

    // If we've set this value in localStorage before, then always use it.
    var expand = !!storage.getItem('expand-listings');
    if (expand === null) {
        // Default to the graphical view at desktop widths and traditional
        // list view at lesser widths.
        expand = caps.widescreen();
    }

    function setTrays(expanded) {
        // Handle tray state and populate preview thumbs.
        // Preserve the tray expand state in localStorage.
        if (expanded !== undefined) {
            expand = expanded;
        }
        $('.app-list').toggleClass('expanded', expanded);
        $('.app-list-filters-expand-toggle').toggleClass('active', expand);
        storage.setItem('expand-listings', !!expanded);
        if (expanded) {
            z.page.trigger('populatetray');
            // Set the `src` for hidden images so they get loaded.
            $('.mkt-tile img[data-src]:not([src])').each(function() {
                this.src = this.getAttribute('data-src');
            });
        }
    }

    z.body.on('click', '.app-list-filters-expand-toggle', utils._pd(function() {
        expand = !expand;
        setTrays(expand);
        z.doc.trigger('scroll');  // For defer image loading.
    }));

    z.page.on('loaded reloaded_chrome', function() {
        // On load - set the tray state on available app lists.
        if ($('.main:not(.feed-landing) .app-list').length) {
            setTrays(expand);
        }
    });

    z.page.on('loaded_more', function() {
        // Remove paginated class from app lists if .loadmore goes away.
        if (!$('.loadmore').length) {
            $('.app-list').removeClass('paginated');
        }
    });
});
