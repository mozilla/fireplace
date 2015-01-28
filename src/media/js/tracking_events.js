/* Centralized UA tracking events.
   Note: UA events are [category, action, label, value].

   Other tracking events are found in other files:
     /popular page views -- automatically tracked on 'navigating'.
     /new page views -- automatically tracked on 'navigating'.
     /category/X page views -- automatically tracked on 'navigating'.

   UA `value`s for app installs.
     0 -- app detail page (because it's the first/only install button)
     x -- index/position on listing of apps
     999999999 -- featured app element.
     999999998 -- editorial brand element.
*/
define('tracking_events',
    ['jquery', 'log', 'navigation', 'settings', 'tracking', 'z'],
    function($, log, navigation, settings, tracking, z) {
    'use strict';
    var console = log('tracking_events');
    var track_log = [];

    var FEATURED_APP_VALUE = 999999999;
    var EDITORIAL_BRAND_VALUE = 999999998;

    // Track package version in UA.
    var packageVersion = settings.package_version;
    if (packageVersion) {
        tracking.setVar(15, 'Package Version', packageVersion);
    } else {
        // Set package version to 0 for hosted.
        tracking.setVar(15, 'Package Version', 0);
    }

    function track(tracking_args) {
        // Send UA event.
        /*jshint validthis:true */
        tracking.trackEvent.apply(this, tracking_args);
        // Log the track.
        track_log.push(tracking_args);
    }

    // Navigation tabs.
    z.body.on('click', '.navbar > li > a', function() {
        track([
            'Nav Click',
            'click',
            $(this).parent().data('tab')
        ]);
    })

    // App list expand toggle (expanded)
    .on('click', '.app-list-filters-expand-toggle:not(.active)', function() {
        track([
            'View type interactions',
            'click',
            'Expanded view'
        ]);
    })

    // App list expand toggle (contracted)
    .on('click', '.app-list-filters-expand-toggle.active', function() {
        track([
            'View type interactions',
            'click',
            'List view'
        ]);
    });

    // Navigate from collection tile to collection detail.
    z.page.on('click', '.feed-collection .view-all', function() {
        track([
            'View Collection',
            'click',
             $(this).closest('.feed-collection').data('tracking-slug')
        ]);
    })

    // Navigate from collection tile to app detail.
    .on('click', '.feed-collection .app-link', function() {
        track([
            'View App from Collection Element',
            'click',
            $(this).closest('.feed-collection').data('tracking-slug')
        ]);
    })

    // Navigate from featured app tile to app detail.
    .on('click', '.featured-app.app-link', function() {
        track([
            'View App from Featured App Element',
            'click',
            $(this).data('tracking-slug')
        ]);
    })

    // Navigate from brand tile to brand detail.
    .on('click', '.feed-brand .fanchor, .feed-brand .view-all', function() {
        track([
            'View Branded Editorial Element',
            'click',
            $(this).closest('.feed-brand').data('tracking-slug')
        ]);
    })

    // Navigate from brand tile to app detail.
    .on('click', '.feed-brand .app-link', function() {
        track([
            'View App from Branded Editorial Element',
            'click',
            $(this).closest('.feed-brand').data('tracking-slug')
        ]);
    })

    // Navigate from operator shelf tile to operator shelf detail.
    .on('click', '.op-shelf.fanchor', function() {
        track([
            'View Operator Shelf Element',
            'click',
            $(this).data('tracking-slug')
        ]);
    })

    // Navigate from operator shelf detail to app detail.
    .on('click', '.shelf-landing a.mkt-tile', function() {
        track([
            'View App from Operator Shelf Element',
            'click',
            $(this).closest('.shelf-landing').data('tracking-slug')
        ]);
    })

    if (tracking.actions_enabled) {
        z.page.on('click', '.detail .support li a.button', function() {
            track([
                'App view interaction',
                'click',
                this.parentNode.getAttribute('data-tracking')
            ]);
        });
    }

    // Tracking methods for specific events.
    function track_app_launch(product) {
        // Track app launch.
        track([
            'Launch app',
            product.payment_required ? 'Paid' : 'Free',
            product.slug
        ]);
    }

    function _get_app_install_value($install_btn) {
        // Given install button, get the appropriate UA value.
        if ($install_btn.closest('.featured-app').length) {
            // Fixed value for apps.
            return FEATURED_APP_VALUE;
        }
        if ($install_btn.closest('.feed-brand').length) {
            // Fixed value for brands.
            return EDITORIAL_BRAND_VALUE;
        }
        if ($install_btn.closest('.feed-collection').length) {
            // Only get position within the listing collection.
            return $('.feed-collection .button.product').index($install_btn);
        }
        // Position within app listing.
        return $('.button.product').index($install_btn);
    }

    function track_app_install_begin(product, $install_btn) {
        // Track app install start.
        track([
            'Click to install app',
            product.receipt_required ? 'paid' : 'free',
            product.name + ':' + product.id,  // TODO: ask to use product.slug.
            _get_app_install_value($install_btn)
        ]);
    }

    function track_app_install_success(product, $install_btn) {
        // Track app install finish.
        track([
            'Successful app install',
            product.receipt_required ? 'paid' : 'free',
            product.name + ':' + product.id,  // TODO: ask to use product.slug.
            _get_app_install_value($install_btn)
        ]);
    }

    function track_app_install_fail(product, $install_btn) {
        // Track app install fail.
        track([
            'App failed to install',
            product.receipt_required ? 'paid' : 'free',
            product.name + ':' + product.id,  // TODO: ask to use product.slug.
            _get_app_install_value($install_btn)
        ]);
    }

    return {
        track: track,
        track_log: track_log,
        track_search_term: function(page) {
            // page -- whether the search query is being tracked for page view.
            var nav_stack = navigation.stack();
            for (var i = 0; i < nav_stack.length; i++) {
                var item = nav_stack[i];
                if (!item.params || !item.params.search_query) {
                    continue;
                }
                console.log('Found search in nav stack, tracking search term:',
                            item.params.search_query);
                tracking[page ? 'setPageVar' : 'setVar'](
                    13, 'Search query', item.params.search_query);
                return;
            }
            console.log('No associated search term to track.');
        },

        track_app_launch: track_app_launch,
        track_app_install_begin: track_app_install_begin,
        track_app_install_success: track_app_install_success,
        track_app_install_fail: track_app_install_fail
    };
});
