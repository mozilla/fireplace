define('app_list',
    ['core/capabilities', 'core/storage', 'core/utils', 'core/z', 'previews'],
    function(caps, storage, utils, z, previews) {
    'use strict';

    // If we've set this value in localStorage before, then always use it.
    var expand = !!storage.getItem('expand-listings');

    function initTileState() {
        // Handle tile expanded state and populate preview thumbs.
        // Preserve the tile expand state in localStorage.
        $('.app-list').toggleClass('previews-expanded', expand);
        $('.app-list-filters-expand-toggle')
            .toggleClass('active', expand)
            .addClass('show');
        storage.setItem('expand-listings', !!expand);
        if (expand) {
            previews.initialize();
            // Set the `src` for hidden images so they get loaded.
            $('.mkt-tile img[data-src]:not([src])').each(function() {
                this.src = this.getAttribute('data-src');
            });
        }
    }

    z.body.on('click', '.app-list-filters-expand-toggle', utils._pd(function() {
        expand = !expand;
        initTileState();
        z.doc.trigger('image-deferrer--load');
    }));

    z.page.on('loaded reloaded_chrome', function() {
        // On load - set the tile expand state on available app lists.
        if ($('.main:not(.feed-landing-apps) .app-list').length) {
            initTileState();
        }
        $('.app-list').addClass('show-app-list');
    }).on('loaded_more', function() {
        // Remove paginated class from app lists if .loadmore goes away.
        if (!$('.loadmore').length) {
            $('.app-list').removeClass('paginated');
        }
    });
});
