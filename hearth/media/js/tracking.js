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
            console.log('Tracking page view', window.location.href);
            window._gaq.push(['_trackPageview', window.location.href]);
            window._gaq.push([
                '_setCustomVar',
                3,
                'Site section',
                'Consumer',
                3
            ])
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
            window._gaq.push(['_setCustomVar'].concat(Array.prototype.slice.call(arguments, 0)));
        }),
        trackEvent: actionWrap(function() {
            window._gaq.push(['_trackEvent'].concat(Array.prototype.slice.call(arguments, 0)));
        })
    };

});
