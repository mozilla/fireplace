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
        'helpers',  // Must come before mostly everything else.
        'helpers_local',
        'apps_buttons',
        'cache',
        'capabilities',
        'components',
        'consumer_info',
        'compatibility_filtering_select',
        'content-ratings',
        'forms',
        'image-deferrer',
        'l10n',
        'lightbox',
        'log',
        'login',
        'models',
        'navbar',
        'navigation',
        'outgoing_links',
        'overlay',
        'perf_events',
        'perf_helper',
        'previews',
        'ratings',
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
    var format = require('format');
    var $ = require('jquery');
    var settings = require('settings');
    var siteConfig = require('site_config');
    var nunjucks = require('templates');
    var urls = require('urls');
    var user = require('user');
    var utils_local = require('utils_local');
    var z = require('z');

    var console = require('log')('mkt');

    // Use Native Persona, if it's available.
    if (capabilities.firefoxOS && 'mozId' in navigator && navigator.mozId !== null) {
        console.log('Native Persona is available');
        window.navigator.id = navigator.id = navigator.mozId;
    }

    if (!capabilities.performance) {
        // Polyfill `performance.now` for PhantomJS.
        // (And don't even bother with `Date.now` because IE.)
        window.performance = {
            now: function() {
                return +new Date();
            }
        };
    }
    var start_time = performance.now();

    console.log('Dependencies resolved, starting init');

    console.log('Package version: ' + (settings.package_version || 'N/A'));

    // Jank hack because Persona doesn't allow scripts in the doc iframe.
    // Please just delete it when they don't do that anymore.
    // Note: If this list changes - please change it in webpay too or let #payments know.
    var doc_langs = ['cs', 'de', 'el', 'en-US', 'es', 'hr', 'hu', 'it', 'pl', 'pt-BR', 'sr', 'zh-CN'];
    var doc_lang = doc_langs.indexOf(navigator.l10n.language) >= 0 ? navigator.l10n.language : 'en-US';
    var doc_location = urls.media('/docs/{type}/' + doc_lang + '.html?20141001');
    settings.persona_tos = format.format(doc_location, {type: 'terms'});
    settings.persona_privacy = format.format(doc_location, {type: 'privacy'});

    z.body.addClass('html-' + require('l10n').getDirection());

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
        // Remove the splash screen.
        console.log('Hiding splash screen (' + ((performance.now() - start_time) / 1000).toFixed(6) + 's)');
        var splash = $('#splash-overlay').addClass('hide');
        z.body.removeClass('overlayed').addClass('loaded');
        apps.getInstalled().done(buttons.mark_btns_as_installed);
        setTimeout(function() {
            z.page.trigger('splash_removed');
        }, 1500);
    });

    // This lets you refresh within the app by holding down command + R.
    if (capabilities.chromeless) {
        window.addEventListener('keydown', function(e) {
            if (e.keyCode == 82 && e.metaKey) {
                window.location.reload();
            }
        });
    }

    z.page.on('iframe-loaded', function() {
        // Triggered by apps-iframe-installer.
        apps.getInstalled().done(function() {
            z.page.trigger('mozapps_got_installed');
            buttons.mark_btns_as_installed();
        });
    });

    if (capabilities.webApps) {
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
            region: user_helpers.region('restofworld'),
            z: z
        };
        $('#site-header').html(
            nunjucks.env.render('header.html', context));
        $('#site-footer').html(
            nunjucks.env.render('footer.html', context));

        if (!window['incompatibility-banner'] &&
                !navigator.mozApps &&
                !navigator.userAgent.match(/googlebot/i)) {
            console.log('Adding incompatibility banner');
            $('#site-nav').after(nunjucks.env.render('incompatible.html'));
        }

        var logged_in = user.logged_in();

        siteConfig.promise.then(function () {
            if (capabilities.nativeFxA()) {
                // We might want to style things differently for native FxA users,
                // specifically they should need to log out through settings instead
                // of through Marketplace (hide logout buttons for bug 1073177).
                // Unfortunately we need to wait for the switches to load.
                z.body.addClass('native-fxa');
            }

            var banner = document.getElementById('fx-accounts-banner');
            if (banner) {
                banner.dismissBanner();
            }
            if (user.canMigrate()) {
                $('#site-nav').after(
                    nunjucks.env.render('fx-accounts-banner.html',
                                        {logged_in: logged_in}));
            }

            // To show or not to show the recommendations nav.
            if (logged_in && settings.switches.indexOf('recommendations') !== -1) {
                z.body.addClass('show-recommendations');
            }

            // Re-render footer region if necessary.
            var current_region = user_helpers.region('restofworld');
            if (current_region !== context.region) {
                console.log('Region has changed from ' + context.region +
                            ' to ' + current_region + ' since we rendered ' +
                            'the footer, updating region in footer.');
                $('#site-footer span.region')
                    .removeClass('region-' + context.region)
                    .addClass('region-' + current_region)
                    .text(settings.REGION_CHOICES_SLUG[current_region]);
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

    var ImageDeferrer = require('image-deferrer');
    var iconDeferrer = ImageDeferrer.Deferrer(100, null);
    var screenshotDeferrer = ImageDeferrer.Deferrer(null, 200);
    z.page.one('loaded', function() {
        iconDeferrer.setImages($('.icon.deferred'));
        screenshotDeferrer.setImages($('.screenshot .deferred, .deferred-background'));
    }).on('loaded loaded_more navigate fragment_loaded', function() {
        iconDeferrer.refresh();
        screenshotDeferrer.refresh();
    });
    require('nunjucks').require('globals').imgAlreadyDeferred = function(src) {
        /*
            If an image already has been loaded, we use this helper in case the
            view is triggered to be rebuilt. When pages are rebuilt, we don't
            mark images to be deferred if they have already been loaded.
            This fixes images flashing back to the placeholder image when
            switching between the New and Popular tabs on the home page.
        */
        var iconsLoaded = iconDeferrer.getSrcsAlreadyLoaded();
        var screenshotsLoaded = screenshotDeferrer.getSrcsAlreadyLoaded();
        var loaded = iconsLoaded.concat(screenshotsLoaded);
        return loaded.indexOf(src) !== -1;
    };

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

    console.log('Initialization complete');
});
