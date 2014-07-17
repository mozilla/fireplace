// Do this last- initialize the marketplace!
console.log('Mozilla(R) FP-MKT (R) 1.0');
console.log('   (C)Copyright Mozilla Corp 1998-2014');
console.log('');
console.log('64K High Memory Area is available.');

require.config({
    enforceDefine: true,
    paths: {
        'flipsnap': 'lib/flipsnap',
        'jquery': 'lib/jquery-2.0.2',
        'underscore': 'lib/underscore',
        'nunjucks': 'lib/nunjucks',
        'nunjucks.compat': 'lib/nunjucks.compat',
        'templates': '../../templates',
        'settings': ['settings_local', 'settings'],
        'format': 'lib/format',
        'textoverflowclamp': 'lib/textoverflowclamp'
    }
});

define(
    'marketplace',
    [
        'underscore',
        'jquery',
        'helpers',  // Must come before mostly everything else.
        'helpers_local',
        'apps_buttons',
        'cache',
        'capabilities',
        'consumer_info',
        'mobilenetwork',  // Must come before cat-dropdown (for amd.js)
        'cat-dropdown',
        'content-ratings',
        'forms',
        'header',
        'image-deferrer',
        'l10n',
        'lightbox',
        'log',
        'login',
        'models',
        'navigation',
        'outgoing_links',
        'overlay',
        'perf_events',
        'perf_helper',
        'previews',
        'ratings',
        'requests',
        'settings',
        'storage',
        'templates',
        'tracking',
        'urls',
        'user',
        'user_helpers',
        'utils',
        'views',
        'webactivities',
        'z'
    ],
function(_) {
    var apps = require('apps');
    var buttons = require('apps_buttons');
    var capabilities = require('capabilities');
    var format = require('format');
    var $ = require('jquery');
    var settings = require('settings');
    var nunjucks = require('templates');
    var urls = require('urls');
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

    // Jank hack because Persona doesn't allow scripts in the doc iframe.
    // Please just delete it when they don't do that anymore.
    // Note: If this list changes - please change it in webpay too or let #payments know.
    var doc_langs = ['cs', 'de', 'el', 'en-US', 'es', 'hr', 'hu', 'it', 'pl', 'pt-BR', 'sr', 'zh-CN'];
    var doc_lang = doc_langs.indexOf(navigator.l10n.language) >= 0 ? navigator.l10n.language : 'en-US';
    var doc_location = urls.media('/docs/{type}/' + doc_lang + '.html?20140717');
    settings.persona_tos = format.format(doc_location, {type: 'terms'});
    settings.persona_privacy = format.format(doc_location, {type: 'privacy'});

    z.body.addClass('html-' + require('l10n').getDirection());
    if (settings.body_classes) {
        z.body.addClass(settings.body_classes);
    }

    z.page.one('loaded', function() {
        // Remove the splash screen.
        console.log('Hiding splash screen (' + ((performance.now() - start_time) / 1000).toFixed(6) + 's)');
        var splash = $('#splash-overlay').addClass('hide');
        z.body.removeClass('overlayed').addClass('loaded');
        apps.getInstalled().done(buttons.mark_btns_as_installed);
        setTimeout(function() {
            z.page.trigger('splash_removed');
            splash.remove();
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
                if (require('user').logged_in()) {
                    require('consumer_info').fetch(true);
                }
                apps.getInstalled().done(buttons.mark_btns_as_uninstalled);
            }
        }, false);
    }

    // Do some last minute template compilation.
    z.page.on('reload_chrome', function() {
        console.log('Reloading chrome');
        var context = {z: z};
        $('#site-header').html(
            nunjucks.env.render('header.html', context));
        $('#site-footer').html(
            nunjucks.env.render('footer.html', context));

        if (!navigator.mozApps &&
            !navigator.userAgent.match(/googlebot/i) &&
            !require('storage').getItem('hide_incompatibility_banner')) {
            console.log('Adding incompatibility banner');
            $('#incompatibility-banner').html(
                nunjucks.env.render('incompatible.html'));
            z.body.addClass('show-incompatibility-banner');
        }

        z.body.toggleClass('logged-in', require('user').logged_in());
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

    z.body.on('click', '#incompatibility-banner .close', function(e) {
        e.preventDefault();
        console.log('Hiding incompatibility banner');
        z.body.removeClass('show-incompatibility-banner');
        require('storage').setItem('hide_incompatibility_banner', true);
    });

    var ImageDeferrer = require('image-deferrer');
    var iconDeferrer = ImageDeferrer.Deferrer(100, null);
    var screenshotDeferrer = ImageDeferrer.Deferrer(null, 200);
    z.page.one('loaded', function() {
        iconDeferrer.setImages($('.icon.deferred'));
        screenshotDeferrer.setImages($('.screenshot img.deferred'));
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

    require('consumer_info').promise.done(function() {
        console.log('Triggering initial navigation');
        if (!z.spaceheater) {
            z.page.trigger('navigate', [window.location.pathname + window.location.search]);
        } else {
            z.page.trigger('loaded');
        }
    });

    // Set the tracking consumer page variable.
    //require('tracking').setVar(3, 'Site section', 'Consumer', 3);

    require('requests').on('deprecated', function() {
        // Divert the user to the deprecated view.
        z.page.trigger('divert', [urls.reverse('deprecated')]);
        throw new Error('Cancel navigation; deprecated client');
    });

    console.log('Initialization complete');
});
