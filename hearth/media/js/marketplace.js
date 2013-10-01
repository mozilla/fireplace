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
    }
});

(function() {

    define(
        'marketplace',
        [
            'underscore',
            'helpers',  // Must come before mostly everything else.
            'buttons',
            'cache',
            'capabilities',
            'cat-dropdown',
            'forms',
            'header',
            'l10n',
            'lightbox',
            'log',
            'login',
            'mobilenetwork',
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
            'utils',
            'views',
            'webactivities',
            'z'
        ],
    function(_) {
        var log = require('log');
        var console = log('mkt');
        console.log('Dependencies resolved, starting init');

        var capabilities = require('capabilities');
        var nunjucks = require('templates');
        var settings = require('settings');
        var user = require('user');
        var z = require('z');

        nunjucks.env.dev = true;

        z.body.addClass('html-' + require('l10n').getDirection());
        if (settings.body_classes) {
            z.body.addClass(settings.body_classes);
        }

        z.page.one('loaded', function() {
            console.log('Hiding splash screen');
            var splash = $('#splash-overlay').addClass('hide');
            // Remove the splash screen once it's visible.
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
                    buttons.buttonInstalled(val.manifestURL.split('?')[0], val);
                });
            };
        };
        if (capabilities.webApps) {
            var get_installed_debounced = _.debounce(get_installed, 2000, true);  // Immediate so there's no delay.
    
            z.page.on('loaded', get_installed);
            z.page.on('fragment_loaded loaded_more', get_installed_debounced);
            document.addEventListener(
                'visibilitychange',
                function() {
                    if (document.hidden) {
                        return;
                    }
                    require('views').reload();
                },
                false
            );
        }

        // Do some last minute template compilation.
        z.page.on('reload_chrome', function() {
            console.log('Reloading chrome');
            var context = {z: z};
            $('#site-header').html(
                nunjucks.env.getTemplate('header.html').render(context));
            $('#site-footer').html(
                nunjucks.env.getTemplate('footer.html').render(context));

            z.body.toggleClass('logged-in', require('user').logged_in());
            z.page.trigger('reloaded_chrome');
        }).trigger('reload_chrome');

        z.page.on('before_login before_logout', function() {
            var cat_url = require('urls').api.url('categories');
            require('cache').purge(function(key) {return key != cat_url;});
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

        // Perform initial navigation.
        console.log('Triggering initial navigation');
        if (!z.spaceheater) {
            z.page.trigger('navigate', [window.location.pathname + window.location.search]);
        } else {
            z.page.trigger('loaded');
        }

        // Set the tracking consumer page variable.
        //require('tracking').setVar(3, 'Site section', 'Consumer', 3);

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

        require('requests').on('success', function(_, xhr) {
            var filter_header;
            try {
                if ((!user.get_setting('region') || user.get_setting('region') == 'internet') &&
                    (filter_header = xhr.getResponseHeader('API-Filter'))) {
                    var region = require('utils').getVars(filter_header).region;
                    log.persistent('mobilenetwork', 'change').log('API overriding region:', region);
                    user.update_settings({region: region});
                }
            } catch(e) {}
        }).on('deprecated', function() {
            // Divert the user to the deprecated view.
            z.page.trigger('divert', [require('urls').reverse('deprecated')]);
            throw new Error('Cancel navigation; deprecated client');
        });

        console.log('Initialization complete');
    });

})();
