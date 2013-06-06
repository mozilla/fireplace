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
        'stick': 'lib/stick',
        'format': 'lib/format'
    },
    shim: {
        'flipsnap': {exports: 'Flipsnap'},
        'jquery': {exports: 'jQuery'},
        'underscore': {exports: '_'}
    }
});

(function() {

    define(
        'marketplace',
        [
            'underscore',
            'buttons',
            'capabilities',
            'cat-dropdown',
            'forms',
            'header',
            'helpers',
            'install',
            'l10n',
            'lightbox',
            'log',
            'login',
            'mobilenetwork',
            'navigation',
            'outgoing_links',
            'overlay',
            'paginator',
            'previews',
            'ratings',
            'settings',
            'storage',
            'templates',
            'tracking',
            'user',
            'webactivities',
            'z'
        ],
    function(_) {
        var console = require('log')('mkt');
        console.log('Dependencies resolved, starting init');

        var capabilities = require('capabilities');
        var nunjucks = require('templates');
        var settings = require('settings');
        var z = require('z');

        nunjucks.env.dev = true;

        z.body.addClass('html-' + require('l10n').getDirection());
        if (settings.body_classes) {
            z.body.addClass(settings.body_classes);
        }

        z.page.one('loaded', function() {
            console.log('Hiding splash screen');
            $('#splash-overlay').addClass('hide');
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
            if (!capabilities.webApps) {
                return;
            }
            z.apps = {};
            z.state.mozApps = {};
            // Get list of installed apps and mark as such.
            var r = navigator.mozApps.getInstalled();
            r.onsuccess = function() {
                _.each(r.result, function(val) {
                    z.apps[val.manifestURL] = z.state.mozApps[val.manifestURL] = val;
                    z.win.trigger('app_install_success',
                                  [val, {'manifest_url': val.manifestURL}, false]);
                });
            };
        };
        var get_installed_debounced = _.debounce(get_installed, 2000, true);  // Immediate so there's no delay.

        z.page.on('loaded', get_installed);
        z.page.on('fragment_loaded loaded_more', get_installed_debounced);

        // Do some last minute template compilation.
        z.page.on('reload_chrome', function() {
            console.log('Reloading chrome');
            var context = _.extend({z: z}, require('helpers'));

            $('#site-header').html(
                nunjucks.env.getTemplate('header.html').render(context));
            $('#site-footer').html(
                nunjucks.env.getTemplate('footer.html').render(context));

            z.body.toggleClass('logged-in', require('user').logged_in());
            z.page.trigger('reloaded_chrome');
        }).trigger('reload_chrome');

        window.addEventListener(
            'resize',
            _.debounce(function() {z.doc.trigger('saferesize');}, 200),
            false
        );

        // Perform initial navigation.
        console.log('Triggering initial navigation');
        z.page.trigger('navigate', [window.location.pathname + window.location.search]);

        // Debug page
        (function() {
            var to = false;
            z.doc.on('touchstart mousedown', '.wordmark', function(e) {
                console.log('hold for debug...', e.type);
                clearTimeout(to);
                to = setTimeout(function() {
                    console.log('navigating to debug...');
                    z.page.trigger('navigate', ['/debug']);
                }, 3000);
            }).on('touchend mouseup', '.wordmark', function(e) {
                console.log('debug hold released...', e.type);
                clearTimeout(to);
            });
        })();

        console.log('Initialization complete');
    });

})();
