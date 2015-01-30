/* Centralized UA tracking events.
   Note: UA events are [category, action, label, value].

   Other tracking events are found in other files:
     mobilenetwork.js -- region change.
     views/search.js -- no results event.
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
    ['jquery', 'log', 'navigation', 'settings', 'tracking', 'utils', 'z'],
    function($, log, navigation, settings, tracking, utils, z) {
    'use strict';
    var logger = log('tracking_events');

    var trackEvent = tracking.trackEvent;
    var setVar = tracking.setVar;
    var setPageVar = tracking.setPageVar;

    var FEATURED_APP_VALUE = 999999999;
    var EDITORIAL_BRAND_VALUE = 999999998;

    // Track package version in UA.
    var packageVersion = settings.package_version;
    if (packageVersion) {
        setVar(15, 'Package Version', packageVersion);
    } else {
        // Set package version to 0 for hosted.
        setVar(15, 'Package Version', 0);
    }

    // Navigation tabs.
    z.body.on('click', '.navbar > li > a', function() {
        trackEvent(
            'Nav Click',
            'click',
            $(this).closest('li').data('tab')
        );
    })

    // App list expand toggle (expanded)
    .on('click', '.app-list-filters-expand-toggle:not(.active)', function() {
        trackEvent(
            'View type interactions',
            'click',
            'Expanded view'
        );
    })

    // App list expand toggle (contracted)
    .on('click', '.app-list-filters-expand-toggle.active', function() {
        trackEvent(
            'View type interactions',
            'click',
            'List view'
        );
    })

    // Lightbox open (previews, screenshots).
    .on('lightbox-open', function() {
        if (z.context.type.split(' ').indexOf('detail') !== -1) {
            trackEvent(
                'App view interactions',
                'click',
                'Screenshot view'
            );
        } else {
            trackEvent(
                'Category view interactions',
                'click',
                'Screenshot view'
            );
        }
    });

    // Navigate from collection tile to collection detail.
    z.page.on('click', '.feed-collection .view-all-tab', function() {
        trackEvent(
            'View Collection',
            'click',
             $(this).closest('.feed-collection').data('tracking')
        );
    })

    // Navigate from collection tile to app detail.
    .on('click', '.feed-collection .mkt-tile', function() {
        trackEvent(
            'View App from Collection Element',
            'click',
            $(this).closest('.feed-collection').data('tracking')
        );
    })

    // Navigate from featured app tile to app detail.
    .on('click', '.featured-app', function() {
        trackEvent(
            'View App from Featured App Element',
            'click',
            $(this).data('tracking')
        );
    })

    // Navigate from brand tile to brand detail.
    .on('click', '.brand-header, .feed-brand .view-all-tab', function() {
        trackEvent(
            'View Branded Editorial Element',
            'click',
            $(this).closest('.feed-brand').data('tracking')
        );
    })

    // Navigate from brand tile to app detail.
    .on('click', '.feed-brand .mkt-tile', function() {
        trackEvent(
            'View App from Branded Editorial Element',
            'click',
            $(this).closest('.feed-brand').data('tracking')
        );
    })

    // Navigate from operator shelf tile to operator shelf detail.
    .on('click', '.op-shelf', function() {
        trackEvent(
            'View Operator Shelf Element',
            'click',
            $(this).data('tracking')
        );
    })

    // Navigate from operator shelf detail to app detail.
    .on('click', '[data-shelf-landing-carrier] .mkt-tile', function() {
        trackEvent(
            'View App from Operator Shelf Element',
            'click',
            $('[data-tracking]').data('tracking')
        );
    })

    .on('click', '.description-wrapper + .truncate-toggle', function() {
        trackEvent(
            'App view interactions',
            'click',
            'Toggle description'
        );
    });

    // Add review.
    z.doc.on('submit', '.add-review-form', utils._pd(function() {
        var slug = this.elements.app.value;
        var rating = this.elements.rating.value;

        trackEvent(
            'App view interactions',
            'click',
            'Successful review'
        );
        trackEvent('Write a Review', 'click', slug, rating);
        setVar(12, 'Reviewer', 'Reviewer', 1);
    }));

    if (tracking.actions_enabled) {
        z.page.on('click', '.app-support .button', function() {
            trackEvent(
                'App view interaction',
                'click',
                this.parentNode.getAttribute('data-tracking')
            );
        });
    }

    // Tracking methods for specific events.
    function track_app_launch(product) {
        // Track app launch.
        trackEvent(
            'Launch app',
            product.payment_required ? 'Paid' : 'Free',
            product.slug
        );
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
        return $('.button.install').index($install_btn);
    }

    function track_app_install_begin(product, $install_btn) {
        // Track app install start.
        trackEvent(
            'Click to install app',
            product.receipt_required ? 'paid' : 'free',
            product.name + ':' + product.id,
            _get_app_install_value($install_btn)
        );
    }

    function track_app_install_success(product, $install_btn) {
        // Track app install finish.
        trackEvent(
            'Successful app install',
            product.receipt_required ? 'paid' : 'free',
            product.name + ':' + product.id,
            _get_app_install_value($install_btn)
        );
    }

    function track_app_install_fail(product, $install_btn) {
        // Track app install fail.
        trackEvent(
            'App failed to install',
            product.receipt_required ? 'paid' : 'free',
            product.name + ':' + product.id,
            _get_app_install_value($install_btn)
        );
    }

    return {
        track_search_term: function(page) {
            // page -- whether the search query is being tracked for page view.
            var nav_stack = navigation.stack();
            for (var i = 0; i < nav_stack.length; i++) {
                var item = nav_stack[i];
                if (!item.params || !item.params.search_query) {
                    continue;
                }
                logger.log('Found search in nav stack, tracking search term:',
                           item.params.search_query);
                tracking[page ? 'setPageVar' : 'setVar'](
                    13, 'Search query', item.params.search_query);
                return;
            }
            logger.log('No associated search term to track.');
        },
        track_app_launch: track_app_launch,
        track_app_install_begin: track_app_install_begin,
        track_app_install_success: track_app_install_success,
        track_app_install_fail: track_app_install_fail
    };
});
