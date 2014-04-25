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
            storage: 'none',
            clientId: clientID,
        });
        if (sect) {
            window.ga('set', 'dimension' + sect_index, sect);
        }
        window.ga('set', 'checkProtocolTask', function(){});
        window.ga('send', 'pageview', initial_url);
    }

    var potato_initialized = false;
    var potato_iframe;
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
                    settings.tracking_section + '", ' + settings.tracking_section_index + ');',
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
            // Pass page vars to UA
            console.log('Tracking page view', url);
            var uadata = _.extend({'page': url, 'title': document.title}, ua_page_vars);
            ua_push('send', 'pageview', uadata);
            ua_page_vars = {};
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
            ua_push('set', 'dimension' + index, value);
        }),
        setPageVar: actionWrap(function(index, name, value) {
            ua_page_vars['dimension' + index] = value;
        }),
        trackEvent: actionWrap(function() {
            var args = Array.prototype.slice.call(arguments, 0);
            ua_push.apply(this, ['send', 'event'].concat(args));
        })
    };

});
