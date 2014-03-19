// Do this last- initialize the marketplace!
console.log('Mozilla(R) FP-MKT (R) 1.0');
console.log('   (C)Copyright Mozilla Corp 1998-2013');
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
        'buttons',
        'cache',
        'capabilities',
        'consumer_info',
        'mobilenetwork',  // Must come before cat-dropdown (for amd.js)
        'cat-dropdown',
        'forms',
        'header',
        'l10n',
        'lightbox',
        'log',
        'login',
        'models',
        'navigation',
        'outgoing_links',
        'overlay',
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
    var console = require('log')('mkt');
    console.log('Dependencies resolved, starting init');

    var $ = require('jquery');
    var capabilities = require('capabilities');
    var format = require('format');
    var nunjucks = require('templates');
    var settings = require('settings');
    var z = require('z');

    var nunjucks_globals = require('nunjucks').require('globals');
    nunjucks_globals.REGIONS = settings.REGION_CHOICES_SLUG;
    nunjucks_globals.user_helpers = require('user_helpers');

    // Jank hack because Persona doesn't allow scripts in the doc iframe.
    // Please just delete it when they don't do that anymore.
    // Note: If this list changes - please change it in webpay too or let #payments know.
    var doc_langs = ['de', 'el', 'en-US', 'es', 'hu', 'it', 'pl', 'pt-BR', 'sr'];
    var doc_lang = doc_langs.indexOf(navigator.l10n.language) >= 0 ? navigator.l10n.language : 'en-US';
    var doc_location = require('urls').media('/docs/{type}/' + doc_lang + '.html?20140227');
    settings.persona_tos = format.format(doc_location, {type: 'terms'});
    settings.persona_privacy = format.format(doc_location, {type: 'privacy'});

    z.body.addClass('html-' + require('l10n').getDirection());

    z.page.one('loaded', function() {
        console.log('Hiding splash screen');
        // Remove the splash screen once it's hidden.
        var splash = $('#splash-overlay').addClass('hide');
        z.body.removeClass('overlayed');
        setTimeout(function() {
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

    var get_installed = function() {
        // Don't getInstalled if the page isn't visible.
        if (document.hidden) {
            return;
        }
        // Get list of installed apps and mark as such.
        var r = navigator.mozApps.getInstalled();
        r.onsuccess = function() {
            var buttons = require('buttons');

            z.apps = {};
            _.each(r.result, function(val) {
                buttons.buttonInstalled(
                    require('utils').baseurl(val.manifestURL), val);
            });
        };
    };
    if (capabilities.webApps) {
        z.page.on('loaded', get_installed);
        z.page.on('fragment_loaded loaded_more',
                  _.debounce(get_installed, 2000, true));  // No delay.
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                return;
            }
            // We switched away from Marketplace, and now we are back and
            // visible. The user might have installed/uninstalled apps during
            // that time, so refresh the list of installed/purchased/developed
            // apps, and check if apps were uninstalled since switching away,
            // refreshing Install buttons if any were.
            if (require('user').logged_in()) {
                require('consumer_info').fetch(true);
            }
            require('buttons').revertUninstalled();
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
        var cat_url = require('urls').api.unsigned.url('categories');
        require('cache').purge(function(key) {return key != cat_url;});
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
        z.page.trigger('divert', [require('urls').reverse('deprecated')]);
        throw new Error('Cancel navigation; deprecated client');
    });

    console.log('Initialization complete');
});
