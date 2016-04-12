/* UA tracking for Fireplace, an application of tracking.js.
   Note: UA events are [category, action, label, customDimensions or value].

   Tracking events that are coded within other modules:
     all page views -- automatically tracked on 'navigating'.
     views/search.js -- no results event.

   UA Custom Dimensions
   --------------------

   1 - Logged In Status
   ======================
   Whether or not the user is logged in.
   Used as session variable.

   2 - Currently-selected Platform Filter
   ======================================
   User's selected active platform filter (e.g., firefoxos, android-tablet).
   Used as session variable.

   3 - Site Section (Consumer or Developer)
   ========================================
   Whether the user is on consumer pages or developer pages.
   Used as session variable, and will be set to 'consumer' here.

   4 - Detected User Platform
   ==========================
   The user's detected user platform (.e.g, all, desktop, android-mobile).
   Adds extra info upon Dimension 2 (Currently-selected Platform Filter).
   Used as session variable.

   5 - Category Name
   =================
   Slug of the category the user has visited.
   Used as a page variable for pageview.

   6 - App Name
   ============
   App name. Possibly varying if developer localized it.
   Used as a page variable for pageview and passed with events.

   7 - App ID
   ==========
   App ID, a number representing it in our database.
   Used as a page variable for pageview and passed with events.

   8 - App Developer
   =================
   App developer name.
   Used as a page variable for pageview and passed with events.

   9 - App View Source
   ===================
   The source from where the user was led to the app detail page. This will
   usually track only the immediately previous page. It is done by setting a
   src query parameter in the URL on app tile links. In some cases, such
   as the Desktop Promo Carousel which leads to a Collection page, we override
   the src to given correct attribution to the Desktop Promo Carousel and not
   the Collection page.
   Used as a page variable for pageview and passed with events.

   10 - App Type (Free or Paid)
   ============================
   Whether or not the app is `free` or `paid`.
   Used as a page variable for pageview and passed with events.

   11 - Marketplace Region
   =======================
   Region from which the user is browsing the Marketplace.
   Used as a session variable.

   12 - Keywords that Lead to an App View
   ======================================
   Search query that leads to an app detail page view. Meaning the user
   searches for an app, and then clicks on one of the app tiles.
   Passed with events and used as a page variable for pageview.

   13 - Keywords that Lead to an App Install
   =========================================
   Search query that leads to an app install. Meaning the user searches for an
   app, and either installs it from the search listing page OR navigates into
   an app detail page and installs the app from there.
   Passed with events (app install event).

   14 - Simulator Traffic
   ======================
   Originally meant to be simulatorTraffic. Actually used in App Submission
   flow to determine which platforms the developer selected for what the app
   was compatible with.

   15 - Marketplace Version
   ========================
   Version of the Marketplace app. This will be 0 if it is hosted/iframed as it
   is in the browser. It will be the package version if it is a true packaged
   app such as for Tarako.
   Used as a session variable.

   16 - Install Attribution for Page
   =================================
   From which page an app was installed. Note this is different from Dimension
   9: App View Source which tracks from which page led the user to the detail
   page.
   Passed with events (app install event).

   17 - Install Attribution for Feed Element
   =========================================
   From which Feed Element an app was installed. The value will be the slug of
   the Feed Element. This will be set whether it is on the homepage Feed or
   from a collection page.
   Passed with events (app install event).

   18 - Content Type
   =================
   e.g., app, website.
   Passed with events.
*/
define('tracking_events',
    ['apps', 'compat_filter', 'consumer_info', 'core/capabilities', 'core/log',
     'core/navigation', 'core/settings', 'core/user', 'core/utils', 'core/z',
     'jquery', 'tracking', 'user_helpers'],
    function(apps, compatFilter, consumerInfo, caps, log,
             navigation, settings, user, utils, z,
             $, tracking, userHelpers) {
    'use strict';
    var logger = log('tracking_events');

    var sendEvent = tracking.sendEvent;
    var setPageVar = tracking.setPageVar;
    var setSessionVar = tracking.setSessionVar;

    var DIMENSIONS = {
        isLoggedIn: 'dimension1',
        platformFilter: 'dimension2',
        siteSection: 'dimension3',
        platform: 'dimension4',
        categoryName: 'dimension5',
        appName: 'dimension6',
        appId: 'dimension7',
        appDeveloper: 'dimension8',
        appViewSource: 'dimension9',
        appPremiumType: 'dimension10',
        region: 'dimension11',
        searchQueryAppView: 'dimension12',
        searchQueryAppInstall: 'dimension13',
        isPackaged: 'dimension15',
        installAttribution: 'dimension16',
        installAttributionSlug: 'dimension17',
        contentType: 'dimension18',
    };

    var SRCS = {
        // {0} replaced by category slug.
        categoryNew: '{0}-new',
        categoryPopular: '{0}-popular',
        detail: 'detail',
        new: 'new',
        newWebsites: 'new-websites',
        popular: 'popular',
        popularHomescreens: 'popular-homescreens',
        popularWebsites: 'popular-websites',
        purchases: 'myapps',
        recommended: 'reco',
        search: 'search',
        // Feed.
        featuredApp: 'featured-app',
        brand: 'branded-editorial-element',
        collection: 'collection-element',
        shelf: 'operator-shelf-element',
    };

    // Srcs that should be persistent all the way through to the app detail
    // page. This handles cases like Desktop Promo -> Collection -> App where
    // Desktop Promo should receive attribution. No longer used due to desktop
    // promo removal.
    var PERSISTENT_SRCS = {};

    // Track logged in.
    setSessionVar(DIMENSIONS.isLoggedIn, user.logged_in());
    z.page.on('logged_in logged_out', function() {
        setSessionVar(DIMENSIONS.isLoggedIn, user.logged_in());
    });

    // Track site section.
    setSessionVar(DIMENSIONS.siteSection, 'Consumer');

    // Track selected active platform filter.
    setSessionVar(DIMENSIONS.platformFilter, compatFilter.getFilterDevice());

    // Track detected platform.
    setSessionVar(DIMENSIONS.platform, caps.device_type());

    // Track region.
    consumerInfo.promise.done(function() {
        setSessionVar(DIMENSIONS.region, userHelpers.region());
    });

    // Track package version in UA.
    var packageVersion = settings.package_version;
    if (packageVersion) {
        setSessionVar(DIMENSIONS.isPackaged, packageVersion);
    } else {
        // Set package version to 0 for hosted.
        setSessionVar(DIMENSIONS.isPackaged, 0);
    }

    // Add review.
    z.doc.on('submit', '.add-review-form', utils._pd(function() {
        var slug = this.elements.app.value;
        var rating = this.elements.rating.value;

        sendEvent(
            'App view interactions',
            'click',
            'Successful review'
        );
        sendEvent('Write a Review', 'click', slug, rating);
    }));

    // Navigation tabs.
    z.body.on('click', 'mkt-nav a', function() {
        sendEvent(
            'Nav Click',
            'click',
            $(this).closest('li').data('mkt-nav--item')
        );
    })
    .on('click', 'mkt-header a', function() {
        var $li = $(this).closest('li');
        sendEvent(
            'Nav Click',
            'click',
            $li.data('mkt-header-nav--item') ||
            $li.data('mkt-header-child--item')
        );
    })

    // App list expand toggle (expanded)
    .on('click', '.app-list-filters-expand-toggle:not(.active)', function() {
        sendEvent(
            'View type interactions',
            'click',
            'Expanded view'
        );
    })

    // App list expand toggle (contracted)
    .on('click', '.app-list-filters-expand-toggle.active', function() {
        sendEvent(
            'View type interactions',
            'click',
            'List view'
        );
    })

    // Lightbox open (previews, screenshots).
    .on('lightbox-open', function() {
        if (z.context.type.split(' ').indexOf('detail') !== -1) {
            sendEvent(
                'App view interactions',
                'click',
                'Screenshot view'
            );
        } else {
            sendEvent(
                'Category view interactions',
                'click',
                'Screenshot view'
            );
        }
    })

    // Change platform filtering options.
    .on('change', '#compat-filter, .compat-filter', function() {
        var filterDevice = this.value;
        setSessionVar(DIMENSIONS.platformFilter, filterDevice);
        sendEvent(
            'Change platform filter',
            'click',
            filterDevice
        );
    });

    // Navigate from collection tile to collection detail.
    z.page.on('click', '.feed-collection .view-all-tab', function() {
        sendEvent(
            'View Collection',
            'click',
             $(this).closest('.feed-collection').data('tracking')
        );
    })

    // Navigate from collection tile to app detail.
    .on('click', '.feed-collection .mkt-tile', function() {
        sendEvent(
            'View App from Collection Element',
            'click',
            $(this).closest('.feed-collection').data('tracking')
        );
    })

    // Navigate from featured app tile to app detail.
    .on('click', '.featured-app', function() {
        sendEvent(
            'View App from Featured App Element',
            'click',
            $(this).data('tracking')
        );
    })

    // Navigate from brand tile to brand detail.
    .on('click', '.brand-header, .feed-brand .view-all-tab', function() {
        sendEvent(
            'View Branded Editorial Element',
            'click',
            $(this).closest('.feed-brand').data('tracking')
        );
    })

    // Navigate from brand tile to app detail.
    .on('click', '.feed-brand .mkt-tile', function() {
        sendEvent(
            'View App from Branded Editorial Element',
            'click',
            $(this).closest('.feed-brand').data('tracking')
        );
    })

    // Navigate from operator shelf tile to operator shelf detail.
    .on('click', '.op-shelf', function() {
        sendEvent(
            'View Operator Shelf Element',
            'click',
            $(this).data('tracking')
        );
    })

    // Navigate from operator shelf detail to app detail.
    .on('click', '[data-shelf-landing-carrier] .mkt-tile', function() {
        sendEvent(
            'View App from Operator Shelf Element',
            'click',
            $('[data-tracking]').data('tracking')
        );
    })

    .on('click', '.description-wrapper + .truncate-toggle', function() {
        sendEvent(
            'App view interactions',
            'click',
            'Toggle description'
        );
    })

    .on('click', '.app-support .button, .app-report-abuse .button', function() {
        sendEvent(
            'App view interaction',
            'click',
            this.getAttribute('data-tracking') ||
            this.parentNode.getAttribute('data-tracking')
        );
    })

    .on('click', '[data-content-type="website"] + .mkt-app-button, .mkt-website-link', function() {
        var root = this;
        sendEvent(
            'View Website',
            'click',
            getWebsiteEventLabel($(root)),
            getAppDimensions($(root), {isWebsite: true})
        );
    });

    function getWebsiteEventLabel($installBtn) {
        var item = $installBtn.data('product');
        return item.name + ':' + item.id;
    }

    function getAppDimensions($installBtn, opts) {
        // Given install button, return an object with appropriate custom UA
        // dimensions set.
        opts = opts || {};
        var custom = {};
        var item = apps.transform($installBtn.data('product'));

        custom[DIMENSIONS.appName] = item.name;
        custom[DIMENSIONS.appId] = item.id + '';

        if (opts.isWebsite) {
            custom[DIMENSIONS.contentType] = 'website';
        } else {
            custom[DIMENSIONS.appDeveloper] = item.author;
            custom[DIMENSIONS.appPremiumType] = item.payment_required ?
                                                'paid' : 'free';
            custom[DIMENSIONS.contentType] = 'webapp';
        }

        if (item.isAddon) {
            custom[DIMENSIONS.contentType] = 'addon';
        } else if (item.doc_type === 'homescreen') {
            custom[DIMENSIONS.contentType] = 'homescreen';
        }

        if ($('[data-page-type~="detail"]').length) {
            // Track how we arrived at the app detail page.
            var src = utils.getVars().src || 'direct';
            custom[DIMENSIONS.appViewSource] = src;
        }

        // Attach from where the app was installed.
        custom[DIMENSIONS.installAttribution] = $installBtn.data('source');

        // If from a feed element, attach the feed element's slug.
        var $trackingSlug = $installBtn.closest('[data-tracking]');
        if ($trackingSlug.length) {
            custom[DIMENSIONS.installAttributionSlug] =
                $trackingSlug.data('tracking');
        }

        if (opts.installing || opts.viewing) {
            // Track keywords that lead to an app install or app hit.
            // The opts that determine this are passing from tracking functions
            // like trackAppInstallBegin or trackAppHit.
            var query = _getSearchQueryFromStack();
            if (query) {
                var dim = opts.installing ? DIMENSIONS.searchQueryAppInstall :
                                            DIMENSIONS.searchQueryAppView;
                custom[dim] = query;
            }
        }

        return custom;
    }

    function _getSearchQueryFromStack() {
        // Checks the top two items of the navigation stack to see if a search
        // query was involved. If a search query param can be found on the top
        // of the stack, then the user is on a search page. If it is on the
        // second from the top, then the user is on the detail page FROM the
        // first page.
        var stack = navigation.stack();
        for (var i = 0; i < stack.length; i++) {
            if (stack[i].params && stack[i].params.search_query) {
                logger.log('Search query:', stack[i].params.search_query);
                return stack[i].params.search_query;
            }
        }
    }

    function trackAppHit($installBtn) {
        // Set page vars for app using all the dimensions we can infer from
        // the install button.
        $installBtn = $installBtn || $('.install');
        if (!$installBtn.length) {
            return;
        }
        var dims = getAppDimensions($installBtn, {viewing: true});
        Object.keys(dims).forEach(function(dim) {
            tracking.setPageVar(dim, dims[dim]);
        });
    }

    function trackAppLaunch($installBtn) {
        var app = $installBtn.data('product');

        sendEvent(
            'Launch app',
            app.payment_required ? 'paid' : 'free',
            app.slug,
            getAppDimensions($installBtn)
        );
    }

    function trackAppInstallBegin($installBtn) {
        var app = $installBtn.data('product');

        sendEvent(
            'Click to install app',
            app.receipt_required ? 'paid' : 'free',
            app.name + ':' + app.id,
            getAppDimensions($installBtn, {installing: true})
        );
    }

    function trackAppInstallSuccess($installBtn) {
        var app = $installBtn.data('product');

        sendEvent(
            'Successful app install',
            app.receipt_required ? 'paid' : 'free',
            app.name + ':' + app.id,
            getAppDimensions($installBtn, {installing: true})
        );
    }

    function trackAppInstallFail($installBtn) {
        var app = $installBtn.data('product');

        sendEvent(
            'App failed to install',
            app.receipt_required ? 'paid' : 'free',
            app.name + ':' + app.id,
            getAppDimensions($installBtn, {installing: true})
        );
    }

    function trackCategoryHit(slug) {
        tracking.setPageVar(DIMENSIONS.categoryName, slug);
    }

    return {
        DIMENSIONS: DIMENSIONS,
        PERSISTENT_SRCS: PERSISTENT_SRCS,
        SRCS: SRCS,
        track_search_term: function(page) {
            // page -- whether the search query is being tracked for page view.
            var navigation = require('core/navigation');
            var nav_stack = navigation.stack();
            for (var i = 0; i < nav_stack.length; i++) {
                var item = nav_stack[i];
                if (!item.params || !item.params.search_query) {
                    continue;
                }
                logger.log('Found search in nav stack, tracking search term:',
                           item.params.search_query);
                tracking[page ? 'setPageVar' : 'setSessionVar'](
                    DIMENSIONS.searchQueryAppInstall,
                    item.params.search_query);
                return;
            }
            logger.log('No associated search term to track.');
        },
        trackAppHit: trackAppHit,
        trackAppLaunch: trackAppLaunch,
        trackAppInstallBegin: trackAppInstallBegin,
        trackAppInstallSuccess: trackAppInstallSuccess,
        trackAppInstallFail: trackAppInstallFail,
        trackCategoryHit: trackCategoryHit,
    };
});
