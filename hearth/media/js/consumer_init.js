// Do this last- initialize the marketplace!

(function() {

    z.body.addClass('html-' + document.webL10n.getDirection());

    var splash = $('#splash-overlay');
    z.page.on('loaded', function() {
       splash.addClass('hide');
    });

    var modules = [
        'buttons',
        'capabilities',
        'feedback',
        'install',
        'lightbox',
        'login',
        'navigation',
        'notification',
        'outgoing_links',
        'overlay',
        'paginator',
        'prefetch',
        'previews',
        'ratings',
        'search',
        'state',
        'suggestions',
        'tracking',
        'z'
    ];

    define('marketplace', modules, function() {
        var capabilities = require('capabilities');
        var navigation = require('navigation');
        var z = require('z');

        if (settings.tracking_enabled) {
            // Initialize analytics tracking.
            z.page.on('loaded', function(event, href, popped, state) {
                // Otherwise we'll track back button hits etc.
                if (!popped) {
                    // GA track every fragment loaded page.
                    _gaq.push(['_trackPageview', href]);
                }
            });
        }

        // This lets you refresh within the app by holding down command + R.
        if (z.capabilities.gaia) {
            window.addEventListener('keydown', function(e) {
                if (e.keyCode == 82 && e.metaKey) {
                    window.location.reload();
                }
            });
        }

        z.page.on('loaded', function() {
            z.apps = {};
            z.state.mozApps = {};
            if (capabilities.webApps) {
                // Get list of installed apps and mark as such.
                var r = window.navigator.mozApps.getInstalled();
                r.onsuccess = function() {
                    _.each(r.result, function(val) {
                        z.apps[val.manifestURL] = z.state.mozApps[val.manifestURL] = val;
                        z.win.trigger('app_install_success',
                                      [val, {'manifest_url': val.manifestURL}, false]);
                    });
                };
            }
        });

        // Do some last minute template compilation.
        $('#site-footer').html(
            nunjucks.env.getTemplate('footer.html').render(require('helpers')));
        $('#login').html(
            nunjucks.env.getTemplate('login.html').render(require('helpers')));

        // Perform initial navigation.
        var hash = window.location.hash;
        var use_hash = hash && hash.substr(0, 2) == '#!';
        navigation.navigate(use_hash ? hash : window.location.pathname, {}, false, true);

        // Navigation timing.
        stick.basic();

        // Call `init` for each module.
        _.each(arguments, function(v) {
            if (typeof v === 'object' && 'init' in v) {
                v.init();
            }
        });
    });

    require('marketplace');

})();
