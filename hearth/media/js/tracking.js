define('tracking', ['log', 'settings', 'z'], function(log, settings, z) {

    var console = log('tracking');

    if (!settings.tracking_enabled) {
        console.log('Tracking disabled, aborting init');
        return;
    }

    // GA Tracking.
    window._gaq = window._gaq || [];

    _gaq.push(['_setAccount', settings.tracking_id]);
    _gaq.push(['_trackPageview']);

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
            _gaq.push(['_trackPageview', window.location.href]);
        }
    });

});
