define('tracking', ['log', 'settings', 'storage', 'underscore', 'z'], function(log, settings, storage, _, z) {

    var enabled = settings.tracking_enabled;
    var actions_enabled = settings.action_tracking_enabled;

    var console = log('tracking');

    // Respect DNT.
    var should_not_track = {'yes': 1, '1': 1};
    if (enabled && !settings.dnt_override &&
        (navigator.doNotTrack in should_not_track ||
         navigator.msDoNotTrack in should_not_track)) {
        console.log('DNT enabled; disabling tracking');
        enabled = false;
    }

    var clientID = storage.getItem('clientID');
    if (!clientID && enabled) {
        storage.setItem('clientID', clientID = (Date.now() + Math.random()).toString(36));
    }

    if (!enabled) {
        console.log('Tracking disabled, aborting init');
        return {
            enabled: false,
            actions_enabled: false,
            setVar: function() {},
            setPageVar: function() {},
            trackEvent: function() {}
        };
    }

    function setupGATracking(id, initial_url) {
        window._gaq = window._gaq || [];

        window._gaq.push(['_setAccount', id]);
        if (settings.tracking_section) {
            window._gaq.push([
                '_setCustomVar',
                settings.tracking_section_index,
                'Site section',
                settings.tracking_section,
                3  // Session scope
            ]);
        }
        window._gaq.push(['_trackPageview', initial_url]);

        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        document.body.appendChild(ga);
    }

    function setupUATracking(id, initial_url, clientID, sect, sect_index) {
        window.GoogleAnalyticsObject = 'ga';
        window.ga = window.ga || function() {
            (window.ga.q = window.ga.q || []).push(arguments);
        };
        window.ga.l = 1 * new Date();

        var ua = document.createElement('script');
        ua.type = 'text/javascript';
        ua.async = true;
        ua.src = 'https://www.google-analytics.com/analytics.js';
        document.body.appendChild(ua);

        window.ga('create', id, {
            storage: 'none',  // Don't use cookies/localStorage.
            clientId: clientID
        });
        if (sect) {
            window.ga('set', 'dimension' + sect_index, sect);
        }
        window.ga('send', 'pageview', initial_url);
    }

    var potato_initialized = false;
    var potato_iframe;
    function ga_push(data) {
        if (window._gaq) {
            window._gaq.push(data);
        }
    }
    function ua_push() {
        if (!potato_initialized) {
            if (window.ga) {
                window.ga.apply(this, Array.prototype.slice.call(arguments, 0));
            }
        } else {
            potato_iframe.contentWindow.postMessage(JSON.stringify(arguments), '*');
        }
    }

    function get_url() {
        return window.location.pathname + window.location.search;
    }

    if (settings.ga_tracking_id) {
        console.log('Setting up GA tracking');
        setupGATracking(settings.ga_tracking_id, get_url());
    }
    if (settings.ua_tracking_id) {
        if (settings.potatolytics_enabled) {
            potato_iframe = document.createElement('iframe');
            var origin = window.location.protocol + '//' + window.location.host;
            potato_iframe.src = [
                'data:text/html,',
                '<html><head><body>',
                '<script>',
                '(',
                setupUATracking.toString(),
                ')("' + settings.ua_tracking_id + '", "' + get_url() + '", "' + clientID + '", "' +
                    settings.tracking_site_section + '", ' + settings.tracking_site_section_index + ');',
                'var origin = "' + origin + '";',
                "window.addEventListener('message', function(e) {",
                '  if (e.origin !== origin) {',
                '    window.console.error("[tracking] Message from unknown origin:", e.origin, origin);',
                '    return;',
                '  }',
                '  window.ga.apply(window.ga, JSON.parse(e.data));',
                '  e.source.postMessage("[potatolytics][echo] " + e.data, e.origin);',
                '}, false);',
                '</script>'
            ].join('\n');
            potato_iframe.height = 0;
            potato_iframe.width = 0;
            potato_iframe.style.borderWidth = 0;
            console.log('Setting up tracking with Potatolytics');
            document.body.appendChild(potato_iframe);
            potato_initialized = true;
        } else {
            console.log('Setting up UA tracking without Potatolytics');
            setupUATracking(settings.ua_tracking_id, get_url(), clientID,
                            settings.tracking_site_section, settings.tracking_site_section_index);
        }
    }
    console.log('Tracking initialized');

    var ua_page_vars = {};
    z.win.on('navigating', function(e, popped) {
        // Otherwise we'll track back button hits etc.
        if (!popped) {
            var url = get_url();
            console.log('Tracking page view', url);
            ga_push(['_trackPageview', url]);
            // Pass page vars to UA
            var uadata = _.extend({'page': url, 'title': document.title}, ua_page_vars);
            ua_push('send', 'pageview', uadata);
            ua_page_vars = {};
        }
    });

    var ga_page_vars = [];
    z.page.on('unloading', function() {
        if (ga_page_vars.length) {
            console.groupCollapsed('Cleaning up page vars');
            var i;
            while (i = ga_page_vars.pop()) {
                console.log('Cleaning up var ' + i);
                ga_push(['_deleteCustomVar', i]);
            }
            console.groupEnd();
        }
    });

    function actionWrap(func) {
        if (!actions_enabled) return function() {};
        return func;
    }

    return {
        enabled: true,
        actions_enabled: actions_enabled,
        setVar: actionWrap(function(index, name, value) {
            ga_push(['_setCustomVar'].concat(Array.prototype.slice.call(arguments, 0)));
            ua_push('set', 'dimension' + index, value);
        }),
        setPageVar: actionWrap(function(index, name, value) {
            ga_page_vars.push(index);
            ga_push(['_setCustomVar', index, name, value, 3]);
            ua_page_vars['dimension' + index] = value;
        }),
        trackEvent: actionWrap(function() {
            var args = Array.prototype.slice.call(arguments, 0);
            ga_push(['_trackEvent'].concat(args));
            ua_push.apply(this, ['send', 'event'].concat(args));
        })
    };

});
