/*
    UA tracking library. Sends pageviews, events, and session variables to UA.
    All UA pushes are kept track of in trackLog as an array of tuples.

    Pageviews are sent on z.win.on('navigating unload').
    Use setPageVar to send custom dimensions along with the pageview. Page
    vars for pageviews exist only for the current page; after the user
    navigates away, page vars are cleared.

    Dimensions are attributes that can be used to filter pageviews and events
    so we can create reports for analysis.

    For pageviews, we send ['send', 'pageview', {DIMENSIONS}].
    For events , we send ['send', 'event', <CATEGORY>, <ACTION>, <LABEL>,
                          {DIMENSIONS}].
    For session vars, we send ['set', 'var', <DIMENSION>, <VAL>].

    Make sure to verify by installing Page Analytics Chrome Extension.
*/
define('tracking',
    ['core/log', 'core/settings', 'core/storage', 'core/utils', 'core/z',
     'underscore'],
    function(log, settings, storage, utils, z,
             _) {
    var logger = log('tracking');

    var trackLog = [];
    var pageVars = {};

    var clientID = storage.getItem('clientID');
    if (!clientID) {
        storage.setItem('clientID',
                        clientID = (Date.now() + Math.random()).toString(36));
    }

    function GA() {
        // Wrapper for window.ga to keep track of everything we push.
        var args = _.toArray(arguments);
        trackLog.push(args);
        if (window.ga) {
            return window.ga.apply(this, args);
        } else {
            logger.error('window.ga not found');
        }
    }

    function setupUATracking() {
        // The unminified version of the UA tracking code that Google hands us.
        window.GoogleAnalyticsObject = 'ga';
        window.ga = window.ga || function() {
            (window.ga.q = window.ga.q || []).push(arguments);
        };
        window.ga.l = 1 * new Date();
        var UAScript = document.createElement('script');
        UAScript.type = 'text/javascript';
        UAScript.async = true;
        UAScript.src = 'https://www.google-analytics.com/analytics.js';
        document.body.appendChild(UAScript);

        GA('create', settings.ua_tracking_id, {
            storage: 'none',
            clientId: clientID,
        });

        // Anonymize IP address.
        GA('set', 'anonymizeIp', true);

        // Don't abort if not http/https.
        GA('set', 'checkProtocolTask', function() {});

        // Must send initial pageview for analytics to initialize.
        GA('send', 'pageview');
    }

    var build_id;
    var iframe_src = settings.iframe_potatolytics_src;
    var potato_initialized = false;
    var potato_iframe;
    var potato_queue = [];

    function UAPush() {
        // Send data to UA. If Potatolytics, post-message. Else, window.ga.
        var data = _.toArray(arguments);

        if (settings.potatolytics_enabled) {
            if (data[0] === settings.ua_tracking_id) {
                // If data[0] is our tracking_id, then we need to ensure it's
                // at the top of the queue - that's our initial setup call.
                potato_queue.unshift(data);
            } else {
                // Otherwise, add data to be sent to the bottom of the queue.
                potato_queue.push(data);
            }

            if (potato_initialized) {
                // If potatolytics enabled, send what's in the queue from top.
                var queued;
                while ((queued = potato_queue.shift())) {
                    queued.name = 'potatolytics-tracking';
                    potato_iframe.contentWindow.postMessage(queued,
                                                            iframe_src);
                    trackLog.push(queued);
                }
            }
        } else {
            GA.apply(this, data);
        }

        return data;
    }

    function getUrl() {
        return window.location.pathname + window.location.search;
    }

    if (settings.ua_tracking_id) {
        if (settings.potatolytics_enabled) {
            build_id = z.body.data('build-id-js');
            if (build_id) {
                // If we have a build_id, we can ask zamboni to set a big max-age
                // on the response and use the build_id to cachebust it.
                iframe_src = utils.urlparams(settings.iframe_potatolytics_src, {
                    b: build_id,
                    cache: 31536000
                });
            }
            logger.log('UA iframe init');
            potato_iframe = document.createElement('iframe');
            potato_iframe.id = 'iframe-potatolytics';
            potato_iframe.src = iframe_src;
            potato_iframe.height = 0;
            potato_iframe.width = 0;
            potato_iframe.style.borderWidth = 0;
            document.body.appendChild(potato_iframe);

            window.addEventListener('message', function(e) {
                if (!e.data.name) {
                    return;
                }

                switch (e.data.name) {
                    case 'potatolytics-tracking':
                        // For debugging:
                        // console.warn('[echo] ' + e.data);
                        break;
                    case 'potatolytics-loaded':
                        logger.log('UA iframe loaded');
                        potato_initialized = true;
                        setupUATracking();
                        break;
                }
            });
        } else {
            logger.log('UA tracking init');
            setupUATracking();
        }
    }

    z.win.on('navigating unload', function(e, popped) {
        /*
           Since we are single-page, send pageviews manually.
           Only sends hits *after* we navigate (or unload) away from the page.
           b/c in some cases, have to wait for data to load to get page vars.
        */
        // Pass page vars to UA.
        UAPush('send', 'pageview', _.extend({
            'page': getUrl(),
            'title': document.title
        }, pageVars));

        // Then reset page vars.
        pageVars = {};
    });

    return {
        pageVars: pageVars,
        sendEvent: function() {
            // Push a `send, event` to UA. UAPush expects the args to be
            // applied.
            var args = _.toArray(arguments);
            return UAPush.apply(this, ['send', 'event'].concat(args));
        },
        setPageVar: function(dimension, value) {
            // Set a page variable in the scope of the current page to be used
            // in `send, pageview`. After navigation or unload, pageVars is
            // reset.
            pageVars[dimension] = value;
            return pageVars;
        },
        setSessionVar: function(dimension, value) {
            // Push a `set` to UA. UAPush expects the args to be applied.
            return UAPush.apply(this, ['set', dimension, value]);
        },
        trackLog: trackLog,
    };
});
