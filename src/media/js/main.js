/*
    The main file that initializes the app.
    Only put initialization code in here. Everything else should go into
    separate and appropriate modules. This is not your diaper.
*/
console.log('Mozilla(R) FP-MKT (R) 1.0');
console.log('   (C)Copyright Mozilla Corp 1998-2015');
console.log('');
console.log('64K High Memory Area is available.');

define('main', ['routes', 'settings_app'], function() {
require(['init'], function() {
require([
    'underscore',
    'jquery',
    'apps_buttons',
    'app_list',
    'core/cache',
    'core/capabilities',
    'consumer_info',
    'content-ratings',
    'flipsnap',
    'core/forms',
    'image-deferrer',
    'image-deferrer-mkt',
    'core/l10n',
    'lightbox',
    'core/log',
    'core/login',
    'core/models',
    'marketplace-elements',
    'navbar',
    'newsletter',
    'overlay',
    'perf_events',
    'perf_helper',
    'previews',
    'regions',
    'core/requests',
    'reviews',
    'core/settings',
    'core/site_config',
    'core/storage',
    'templates',
    'tracking',
    'tracking_events',
    'core/urls',
    'core/user',
    'user_helpers',
    'core/utils',
    'utils_local',
    'core/views',
    // These views register global event handlers.
    'views/feedback',
    'views/search',
    'webactivities',
    'core/z'
], function(_) {
    var apps = require('apps');
    var cache = require('core/cache');
    var capabilities = require('core/capabilities');
    var consumer_info = require('consumer_info');
    var format = require('core/format');
    var $ = require('jquery');
    var settings = require('core/settings');
    var siteConfig = require('core/site_config');
    var l10n = require('core/l10n');
    var newsletter = require('newsletter');
    var nunjucks = require('templates');
    var regions = require('regions');
    var urls = require('core/urls');
    var user = require('core/user');
    var utils = require('core/utils');
    var utils_local = require('utils_local');
    var z = require('core/z');

    var logger = require('core/log')('mkt');
    var gettext = l10n.gettext;

    logger.log('Package version: ' + (settings.package_version || 'N/A'));

    if (capabilities.device_type() === 'desktop') {
        z.body.addClass('desktop');
    }

    var start_time = performance.now();

    z.body.addClass('html-' + l10n.getDirection());

    if (settings.body_classes) {
        z.body.addClass(settings.body_classes);
    }

    if (!utils.isSystemDateRecent()) {
        // System date checking.
        z.body.addClass('error-overlaid')
            .append(nunjucks.env.render('errors/date-error.html'))
            .on('click', '.system-date .try-again', function() {
                if (utils.isSystemDateRecent()) {
                    window.location.reload();
                }
            });
    } else {
        utils_local.checkOnline().fail(function() {
            logger.log('We are offline. Showing offline message');
            z.body.addClass('error-overlaid')
                .append(nunjucks.env.render('errors/offline-error.html'))
                .on('click', '.offline .try-again', function() {
                    logger.log('Re-checking online status');
                    utils_local.checkOnline().done(function(){
                        logger.log('Reloading');
                        window.location.reload();
                     }).fail(function() {
                        logger.log('Still offline');
                    });
                });
        });
    }

    z.page.one('loaded', function() {
        if (z.context.hide_splash !== false) {
            // Remove the splash screen.
            logger.log('Hiding splash screen (' +
                        ((performance.now() - start_time) / 1000).toFixed(6) +
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
    if (capabilities.chromeless) {
        window.addEventListener('keydown', function(e) {
            if (e.keyCode == 82 && e.metaKey) {
                window.location.reload();
            }
        });
    }

    if (capabilities.webApps) {
        // Look for Marketplace update.
        var is_packaged_app = window.location.protocol === 'app:';
        var is_iframed_app = window.top !== window.self;
        var appEvent = is_packaged_app ? 'iframe-install-loaded' : 'loaded';
        z.page.one(appEvent, function() {
            var manifest_url = settings.manifest_url;
            var email = user.get_setting('email') || '';
            // Need manifest URL to check for update. Only want to show
            // update notification banner if inside app. Only to mozilla.com
            // users for now.
            if (manifest_url && (is_packaged_app || is_iframed_app) &&
                email.substr(-12) === '@mozilla.com') {
                apps.checkForUpdate(manifest_url).done(function(result) {
                    if (!result) {
                        return;
                    }
                    z.body.on('click', '#marketplace-update-banner .button', utils._pd(function() {
                        var $button = $(this);
                        // Deactivate "remember" on dismiss button so that it
                        // shows up for next update if user clicks on it now
                        // they chose to apply the update.
                        $button.closest('mkt-banner').get(0).dismiss = '';
                        $button.addClass('spin');
                        apps.applyUpdate(manifest_url).done(function() {
                            $('#marketplace-update-banner span').text(gettext(
                                'The next time you start the Firefox Marketplace app, you’ll see the updated version!'));
                            $button.remove();
                        });
                    }));
                    $('#site-nav').after(nunjucks.env.render('marketplace-update.html'));
                });
            } else {
                logger.log('Not in app or manifest_url is absent, ' +
                            'or not a mozilla.com user, skipping update check.');
            }
        });

        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                if (user.logged_in()) {
                    consumer_info.fetch(true);
                }
            }
        }, false);
    }

    // Do some last minute template compilation.
    z.page.on('reload_chrome', function() {
        logger.log('Reloading chrome');
        var user_helpers = require('user_helpers');
        var context = {
            user_region: user_helpers.region('restofworld'),
            z: z
        };
        _.extend(context, newsletter.context());
        $('#site-header').html(
            nunjucks.env.render('header.html', context));
        $('#site-footer').html(
            nunjucks.env.render('footer.html', context));

        if (!navigator.mozApps && !navigator.userAgent.match(/googlebot/i)) {
            if (!document.getElementById('incompatibility-banner')) {
                logger.log('Adding incompatibility banner');
                $('#site-nav').after(nunjucks.env.render('incompatible.html'));
            }
        } else if (capabilities.osXInstallIssues) {
            if ($('mkt-banner[name="mac-banner"]').length === 0) {
                $('#site-nav').after(
                    nunjucks.env.render('_includes/os_x_banner.html'));
            }
        }

        var logged_in = user.logged_in();

        if (!logged_in) {
            z.body.removeClass('show-recommendations');
        }

        siteConfig.promise.then(function() {
            if (capabilities.nativeFxA() || capabilities.yulelogFxA()) {
                // Might want to style things differently for native FxA,
                // like log out through settings instead of Marketplace
                // (bug 1073177), but wait for switches to load.
                z.body.addClass('native-fxa');
            }
        });

        consumer_info.promise.then(function() {
            // Re-render footer region if necessary.
            var current_region = user_helpers.region('restofworld');
            if (current_region !== context.user_region) {
                logger.log('Region has changed from ' + context.user_region +
                            ' to ' + current_region + ' since we rendered ' +
                            'the footer, updating region in footer.');
                $('#site-footer span.region')
                    .removeClass('region-' + context.user_region)
                    .addClass('region-' + current_region)
                    .text(regions.REGION_CHOICES_SLUG[current_region]);
            }
            // To show or not to show the recommendations nav.
            if (logged_in && user.get_setting('enable_recommendations')) {
                z.body.addClass('show-recommendations');
            }
        });

        z.body.toggleClass('logged-in', logged_in);
        z.page.trigger('reloaded_chrome');
    }).trigger('reload_chrome');

    z.page.on('before_login before_logout', function() {
        cache.purge();
    });

    z.body.on('click', '.site-header .back', function(e) {
        e.preventDefault();
        logger.log('← button pressed');
        require('core/navigation').back();
    });

    window.addEventListener(
        'resize',
        _.debounce(function() {z.doc.trigger('saferesize');}, 200),
        false
    );

    consumer_info.promise.done(function() {
        logger.log('Triggering initial navigation');
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

    require('core/requests').on('deprecated', function() {
        // Divert the user to the deprecated view.
        z.page.trigger('divert', [urls.reverse('deprecated')]);
        throw new Error('Cancel navigation; deprecated client');
    });

    logger.log('Initialization complete');
});
});
});
