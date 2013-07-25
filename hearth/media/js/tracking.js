define('tracking', ['log', 'settings', 'z'], function(log, settings, z) {

    var enabled = settings.tracking_enabled;
    var actions_enabled = settings.action_tracking_enabled;

    var console = log('tracking');

    if (!enabled) {
        console.log('Tracking disabled, aborting init');
        return {
            enabled: false,
            actions_enabled: false,
            setVar: function() {},
            trackEvent: function() {}
        };
    }

    function setupTracking(id, initial_url, domain) {
        window._gaq = window._gaq || [];

        window._gaq.push(['_setAccount', id]);
        if (domain) {
            console.log('Setting tracking domain:', domain);
            window._gaq.push(['_setDomainName', domain]);
        }
        window._gaq.push([
            '_setCustomVar',
            3,
            'Site section',
            'Consumer',
            3
        ]);
        window._gaq.push(['_trackPageview', initial_url]);

        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        console.log('Initializing Google Analytics');
        document.body.appendChild(ga);
    }

    var potato_initialized = false;
    var potato_iframe;
    function push(data) {
        if (!potato_initialized) {
            window._gaq.push.apply(window._gaq.push, data);
        } else {
            potato_iframe.contentWindow.postMessage(JSON.stringify(data), '*');
        }
    }

    function get_url() {
        return window.location.pathname + window.location.search;
    }

    if (settings.potatolytics_enabled) {
        potato_iframe = document.createElement('iframe');
        var origin = window.location.protocol + '//' + window.location.host;
        potato_iframe.src = [
            'data:text/html,',
            '<html><head><body>',
            '<script>',
            setupTracking.toString(),
            "var origin = '" + origin + "';",
            'setupTracking("' + settings.tracking_id + '", "' + get_url() + '", "' + window.location.host + '");',
            "window.addEventListener('message', function(e) {",
            '   if (e.origin !== origin) {return;}',
            '   window._gaq.push(JSON.parse(e.data));',
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
        console.log('Setting up tracking without Potatolytics');
        setupTracking(settings.tracking_id, get_url());
    }

    z.win.on('navigating', function(e, popped) {
        // Otherwise we'll track back button hits etc.
        if (!popped) {
            var url = get_url();
            console.log('Tracking page view', url);
            push(['_trackPageview', url]);
        }
    });

    var page_vars = [];

    z.page.on('unloading', function() {
        if (page_vars.length) {
            console.groupCollapsed('Cleaning up page vars');
            var i;
            while (i = page_vars.pop()) {
                console.log('Cleaning up var ' + i);
                push(['_deleteCustomVar', i]);
            }
            console.groupEnd();
        }
    });

    function actionWrap(func) {
        return function() {
            if (!actions_enabled) {
                return;
            }
            func.apply(this, arguments);
        };
    }

    return {
        enabled: true,
        actions_enabled: actions_enabled,
        setVar: actionWrap(function() {
            var args = Array.prototype.slice.call(arguments, 0);
            // If we're setting a page var and it hasn't been defined before,
            // add it to the list of vars that have been set.
            if (args[3] === 3 && page_vars.indexOf(args[0]) === -1) {
                page_vars.push(args[0]);
            }
            push(['_setCustomVar'].concat(args));
        }),
        trackEvent: actionWrap(function() {
            push(['_trackEvent'].concat(Array.prototype.slice.call(arguments, 0)));
        })
    };

});
