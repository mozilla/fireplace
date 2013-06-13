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

    // GA Tracking.
    window._gaq = window._gaq || [];

    window._gaq.push(['_setAccount', settings.tracking_id]);
    window._gaq.push([
        '_setCustomVar',
        3,
        'Site section',
        'Consumer',
        3
    ]);
    window._gaq.push(['_trackPageview']);

    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    // GA is the first script element.
    var s = document.getElementsByTagName('script')[0];
    console.log('Initializing Google Analytics');
    s.parentNode.insertBefore(ga, s);

    z.win.on('navigating', function(e, popped) {
        // Otherwise we'll track back button hits etc.
        if (!popped) {
            console.log('Tracking page view', window.location.pathname);
            window._gaq.push(['_trackPageview']);
        }
    });

    var page_vars = [];

    z.page.on('unloading', function() {
        if (page_vars.length) {
            console.groupCollapsed('Cleaning up page vars');
            var i;
            while (i = page_vars.pop()) {
                console.log('Cleaning up var ' + i);
                window._gaq.push(['_deleteCustomVar', i]);
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
            window._gaq.push(['_setCustomVar'].concat(args));
        }),
        trackEvent: actionWrap(function() {
            window._gaq.push(['_trackEvent'].concat(Array.prototype.slice.call(arguments, 0)));
        })
    };

});
