define('tracking', ['settings', 'z'], function(settings, z) {
    if (!settings.tracking_enabled) {
        return;
    }

    // GA Tracking.
    window._gaq = window._gaq || [];

    _gaq.push(['_setAccount', 'UA-36116321-6']);
    _gaq.push(['_trackPageview']);


    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    // GA is the first script element.
    var s = document.getElementsByTagName('script')[0];
    console.log('[tracking] Initializing Google Analytics');
    s.parentNode.insertBefore(ga, s);

    z.win.on('navigating', function(e, popped) {
        // Otherwise we'll track back button hits etc.
        if (!popped) {
            console.log('[tracking] Tracking page view', window.location.href);
            _gaq.push(['_trackPageview', window.location.href]);
        }
    });

});
