// Do this last- initialize the marketplace!
console.log('Mozilla(R) FP-MKT (R) 1.0');
console.log('   (C)Copyright Mozilla Corp 1998-2014');
console.log('');
console.log('64K High Memory Area is available.');

define(
    'main',
    [
        'underscore',
        'jquery',
        'polyfill', // Must be early.
        'document-register-element',
        'helpers',  // Must come before mostly everything else.
        'helpers_local',
        'apps_buttons',
        'cache',
        'capabilities',
        'consumer_info',
        'compatibility_filtering_select',
        'content-ratings',
        'flipsnap',
        'forms',
        'image-deferrer',
        'image-deferrer-mkt',
        'l10n',
        'lightbox',
        'log',
        'login',
        'marketplace-elements',
        'models',
        'navbar',
        'navigation',
        'newsletter',
        'overlay',
        'perf_events',
        'perf_helper',
        'previews',
        'ratings',
        'regions',
        'requests',
        'settings',
        'site_config',
        'storage',
        'templates',
        'tracking',
        'tracking_events',
        'urls',
        'user',
        'user_helpers',
        'utils',
        'utils_local',
        'views',
        'webactivities',
        'z'
    ],
function(_) {
    var apps = require('apps');
    var buttons = require('apps_buttons');
    var capabilities = require('capabilities');
    var consumer_info = require('consumer_info');
    var flipsnap = require('flipsnap');
    var format = require('format');
    var $ = require('jquery');
    var settings = require('settings');
    var siteConfig = require('site_config');
    var l10n = require('l10n');
    var newsletter = require('newsletter');
    var nunjucks = require('templates');
    var regions = require('regions');
    var urls = require('urls');
    var user = require('user');
    var utils = require('utils');
    var utils_local = require('utils_local');
    var z = require('z');

    var console = require('log')('mkt');
    var gettext = l10n.gettext;

    // Use Native Persona, if it's available.
    if (capabilities.firefoxOS && 'mozId' in navigator && navigator.mozId !== null) {
        console.log('Native Persona is available');
        window.navigator.id = navigator.id = navigator.mozId;
    }

    if (capabilities.device_type() === 'desktop') {
        z.body.addClass('desktop');
    }

    var start_time = performance.now();

    console.log('Dependencies resolved, starting init');

    console.log('Package version: ' + (settings.package_version || 'N/A'));

    // Jank hack because Persona doesn't allow scripts in the doc iframe.
    // Please just delete it when they don't do that anymore.
    // Note: If this list changes - please change it in webpay too or let #payments know.
    var doc_langs = ['cs', 'de', 'el', 'en-US', 'es', 'hr', 'hu', 'it', 'pl', 'pt-BR', 'sr', 'zh-CN'];
    var doc_lang = doc_langs.indexOf(navigator.l10n.language) >= 0 ? navigator.l10n.language : 'en-US';
    var doc_location = urls.media('/docs/{type}/' + doc_lang + '.html?20141223');
    settings.persona_tos = format.format(doc_location, {type: 'terms'});
    settings.persona_privacy = format.format(doc_location, {type: 'privacy'});

    z.body.addClass('html-' + l10n.getDirection());

    if (settings.body_classes) {
        z.body.addClass(settings.body_classes);
    }

    if (!utils_local.isSystemDateRecent()) {
        // System date checking.
        z.body.addClass('error-overlaid')
            .append(nunjucks.env.render('errors/date-error.html'))
            .on('click', '.system-date .try-again', function() {
                if (utils_local.isSystemDateRecent()) {
                    window.location.reload();
                }
            });
    } else {
        utils_local.checkOnline().fail(function() {
            console.log('We are offline. Showing offline message');
            z.body.addClass('error-overlaid')
                .append(nunjucks.env.render('errors/offline-error.html'))
                .on('click', '.offline .try-again', function() {
                    console.log('Re-checking online status');
                    utils_local.checkOnline().done(function(){
                        console.log('Reloading');
                        window.location.reload();
                     }).fail(function() {
                        console.log('Still offline');
                    });
                });
        });
    }

    z.page.one('loaded', function() {
        if (z.context.hide_splash !== false) {
            // Remove the splash screen.
            console.log('Hiding splash screen (' + ((performance.now() - start_time) / 1000).toFixed(6) + 's)');
            var splash = $('#splash-overlay').addClass('hide');
            z.body.removeClass('overlayed').addClass('loaded');
            setTimeout(function() {
                z.page.trigger('splash_removed');
            }, 1500);
        } else {
            console.log('Retaining the splash screen for this view');
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
        // Mark installed apps as such and look for a Marketplace update. If we
        // are in a packaged app, wait for the iframe to be loaded, otherwise
        // we are using the direct installer and we just need to wait for the
        // normal loaded event.
        var is_packaged_app = window.location.protocol === 'app:';
        var is_iframed_app = window.top !== window.self;  // Crude, but enough for our needs.
        var event_for_apps = is_packaged_app ? 'iframe-install-loaded' : 'loaded';
        z.page.one(event_for_apps, function() {
            apps.getInstalled().done(function() {
                z.page.trigger('mozapps_got_installed');
                buttons.mark_btns_as_installed();
            });

            var manifest_url = settings.manifest_url;
            var email = user.get_setting('email') || '';
            // We want to check for an update, so we need the manifest url. In
            // addition, we only want to show the update notification banner if
            // we are inside an app (not just browsing the website) and only
            // to mozilla.com users for now.
            if (manifest_url && (is_packaged_app || is_iframed_app) && email.substr(-12) === '@mozilla.com') {
                apps.checkForUpdate(manifest_url).done(function(result) {
                    if (result) {
                        z.body.on('click', '#marketplace-update-banner a.download-button', utils._pd(function() {
                            var $button = $(this);
                            // Deactivate "remember" on the dismiss button so that it'll
                            // show up for the next update if the user clicks on it now
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
                    }
                });
            } else {
                console.log('Not in an app or manifest_url is absent or not a mozilla.com user, skipping update check.');
            }
        });

        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                // Refresh list of installed apps in case user uninstalled apps
                // and switched back.
                if (user.logged_in()) {
                    consumer_info.fetch(true);
                }
                apps.getInstalled().done(buttons.mark_btns_as_uninstalled);
            }
        }, false);
    }

    // Do some last minute template compilation.
    z.page.on('reload_chrome', function() {
        console.log('Reloading chrome');
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
                console.log('Adding incompatibility banner');
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

        siteConfig.promise.then(function () {
            if (capabilities.nativeFxA() || capabilities.yulelogFxA()) {
                // We might want to style things differently for native FxA users,
                // specifically they should need to log out through settings instead
                // of through Marketplace (hide logout buttons for bug 1073177).
                // Unfortunately we need to wait for the switches to load.
                z.body.addClass('native-fxa');
            }
        });

        // TODO: Move this to the consumer-info callback when the waffle is
        // removed as we no longer require siteConfig for the waffle switch.
        $.when(siteConfig, consumer_info).then(function() {
            // To show or not to show the recommendations nav.
            if (logged_in && user.get_setting('enable_recommendations')) {
                z.body.addClass('show-recommendations');
            }
        });

        consumer_info.promise.then(function() {
            // Re-render footer region if necessary.
            var current_region = user_helpers.region('restofworld');
            if (current_region !== context.user_region) {
                console.log('Region has changed from ' + context.user_region +
                            ' to ' + current_region + ' since we rendered ' +
                            'the footer, updating region in footer.');
                $('#site-footer span.region')
                    .removeClass('region-' + context.user_region)
                    .addClass('region-' + current_region)
                    .text(regions.REGION_CHOICES_SLUG[current_region]);
            }
        });

        z.body.toggleClass('logged-in', logged_in);
        z.page.trigger('reloaded_chrome');
    }).trigger('reload_chrome');

    z.page.on('before_login before_logout', function() {
        require('cache').purge();
    });

    z.body.on('click', '.site-header .back', function(e) {
        e.preventDefault();
        console.log('← button pressed');
        require('navigation').back();
    });

    window.addEventListener(
        'resize',
        _.debounce(function() {z.doc.trigger('saferesize');}, 200),
        false
    );

    consumer_info.promise.done(function() {
        console.log('Triggering initial navigation');
        if (!z.spaceheater) {
            z.page.trigger('navigate', [window.location.pathname + window.location.search]);
        } else {
            z.page.trigger('loaded');
        }
    });

    require('requests').on('deprecated', function() {
        // Divert the user to the deprecated view.
        z.page.trigger('divert', [urls.reverse('deprecated')]);
        throw new Error('Cancel navigation; deprecated client');
    });

    // Remove paginated class from app lists if .loadmore goes away.
    z.page.on('loaded_more', function() {
        if (!$('.loadmore').length) {
            $('.app-list').removeClass('paginated');
        }
    });

    console.log('Initialization complete');
});
