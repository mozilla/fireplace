/*
    The main file that initializes the app.
    Only put initialization code in here. Everything else should go into
    separate and appropriate modules. This is not your diaper.
*/
console.log('Mozilla(R) FP-MKT (R) 2.0');
console.log('64K High Memory Area is available.');

define('main', ['init'], function(init) {
var startTime = performance.now();
init.done(function() {
require(
    [// Modules actually used in main.
     'apps', 'carrier', 'categories', 'core/cache', 'core/capabilities',
     'core/format', 'core/log', 'core/navigation', 'core/nunjucks',
     'core/requests', 'core/settings', 'core/site_config', 'core/l10n',
     'core/urls', 'core/utils', 'core/user', 'core/z', 'consumer_info',
     'jquery', 'newsletter', 'regions', 'underscore', 'update_banner',
     'user_helpers', 'utils_local',
     // Modules we require to initialize global stuff.
     'addon', 'app_list', 'buttons', 'content-ratings', 'core/forms',
     'elements/categories', 'elements/header', 'elements/nav',
     'elements/select', 'flipsnap', 'header_footer', 'helpers_local',
     'image-deferrer-mkt', 'core/login', 'core/models', 'marketplace-elements',
     'overlay', 'perf_events', 'perf_helper', 'previews', 'reviews',
     'startup_errors', 'tracking_events', 'views/feedback', 'views/search',
     'webactivities'],
    function(apps, carrier, categories, cache, caps,
             format, log, navigation, nunjucks,
             requests, settings, siteConfig, l10n,
             urls, utils, user, z, consumerInfo,
             $, newsletter, regions, _, updateBanner,
             userHelpers, utilsLocal) {
    'use strict';
    var logger = log('mkt');

    logger.log('Package version: ' + (settings.package_version || 'N/A'));

    if (caps.device_type() === 'desktop') {
        z.body.addClass('desktop');
    }
    if (settings.body_classes) {
        z.body.addClass(settings.body_classes);
    }

    z.page.one('loaded', function() {
        if (z.context.hide_splash !== false) {
            // Remove the splash screen.
            logger.log('Hiding splash screen (' +
                        ((performance.now() - startTime) / 1000).toFixed(6) +
                        's)');
            var splash = $('#splash-overlay').addClass('hide');
            z.body.removeClass('overlayed').addClass('loaded');
            setTimeout(function() {
                z.page.trigger('splash_removed');
            }, 1500);
        } else {
            logger.log('Retaining the splash screen for this view');
        }
    });

    // This lets you refresh within the app by holding down command + R.
    if (caps.chromeless) {
        window.addEventListener('keydown', function(e) {
            if (e.keyCode == 82 && e.metaKey) {
                window.location.reload();
            }
        });
    }

    if (caps.webApps) {
        // If Marketplace comes back to the front, refresh the list of apps
        // installed/developed/purchased by the user.
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                if (user.logged_in()) {
                    consumerInfo.fetch(true);
                }
            }
        }, false);
    }

    z.page.on('reload_chrome', function() {
        // Do some last minute template compilation.
        logger.log('Reloading chrome');

        if (!caps.webApps && !navigator.userAgent.match(/googlebot/i)) {
            if (!document.getElementById('incompatibility-banner')) {
                logger.log('Adding incompatibility banner');
                $('.banners').append(nunjucks.env.render('incompatible.html'));
            }
        } else if (caps.osXInstallIssues) {
            if ($('mkt-banner[name="mac-banner"]').length === 0) {
                $('.banners').append(
                    nunjucks.env.render('_includes/os_x_banner.html'));
            }
        }

        updateBanner.showIfNeeded();

        if (!user.logged_in()) {
            z.body.removeClass('show-recommendations');
        }

        siteConfig.promise.then(function() {
            if (caps.nativeFxA() || caps.yulelogFxA()) {
                // Might want to style things differently for native FxA,
                // like log out through settings instead of Marketplace
                // (bug 1073177), but wait for switches to load.
                z.body.addClass('native-fxa');
            }
        });

        consumerInfo.promise.then(function() {
            // To show or not to show the recommendations nav.
            if (user.logged_in() &&
                user.get_setting('enable_recommendations')) {
                z.body.addClass('show-recommendations');
            }
        });

        z.body.toggleClass('logged-in', user.logged_in());
        z.page.trigger('reloaded_chrome');
    }).on('install-success reload_chrome', function() {
        carrier.hasInstallableApps().then(function(apps) {
            var $currentBanner = $('mkt-banner[name="carrier-apps-banner"]');
            if (apps) {
                if ($currentBanner.length === 0) {
                    $('.banners').append(
                        nunjucks.env.render('_includes/carrier_apps_banner.html'));
                }
            } else if ($currentBanner) {
                $currentBanner.each(function(i, banner) {
                    banner.dismissBanner();
                });
            }
        });
    }).trigger('reload_chrome');

    z.body.on('dismiss-banner', '[name="carrier-apps-banner"]', function(e) {
        carrier.completeLateCustomization();
    });

    z.page.on('before_login before_logout', function() {
        cache.purge();
    })

    .on('logged_in logged_out', function() {
        var nav = document.querySelector('mkt-nav');
        if (nav) {
            setTimeout(function() {
                nav.toggle(false);
            }, 50);
        }
    });

    window.addEventListener(
        'resize',
        _.debounce(function() {
            document.dispatchEvent(new CustomEvent('saferesize'));
        }, 200),
        false
    );

    consumerInfo.promise.done(function() {
        logger.log('Initial navigation');
        if (!z.spaceheater) {
            var navigateArgs = [window.location.pathname +
                                window.location.search];
            var searchQuery = utils.getVars().q;
            if (window.location.pathname == urls.reverse('search') &&
                searchQuery) {
                navigateArgs.push({search_query: searchQuery});
            }
            z.page.trigger('navigate', navigateArgs);
        } else {
            z.page.trigger('loaded');
        }
    });

    requests.on('deprecated', function() {
        // Divert the user to the deprecated view.
        z.page.trigger('divert', [urls.reverse('deprecated')]);
        throw new Error('Cancel navigation; deprecated client');
    });

    z.body.attr('data-meow--enabled', settings.meowEnabled || false);

    logger.log('Done');
});
});
});
