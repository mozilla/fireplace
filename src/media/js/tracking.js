define('tracking',
    ['core/log', 'core/settings', 'core/storage', 'underscore', 'core/utils', 'core/z'],
    function(log, settings, storage, _, utils, z) {
    var logger = log('tracking');

    var enabled = settings.tracking_enabled;
    var action_tracking_enabled = settings.action_tracking_enabled;

    var track_log = [];
    var track_vars = {};
    var track_page_vars = {};

    var clientID = storage.getItem('clientID');
    if (!clientID && enabled) {
        storage.setItem('clientID', clientID = (Date.now() + Math.random()).toString(36));
    }

    if (!enabled) {
        logger.log('UA tracking disabled');
        return {
            enabled: false,
            action_enabled: false,
            track_log: [],
            track_vars: [],
            track_page_vars: {},
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

    var build_id;
    var iframe_src = settings.iframe_potatolytics_src;
    var potato_initialized = false;
    var potato_iframe;
    var potato_queue = [];

    function ua_push() {
        var data = _.toArray(arguments);
        var queued;

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
                // If potatolytics is enabled, then we send what's in the queue,
                // starting from the top.
                while ((queued = potato_queue.shift())) {
                    queued.name = 'potatolytics-tracking';
                    potato_iframe.contentWindow.postMessage(queued, iframe_src);
                }
            }
        } else if (window.ga) {
            window.ga.apply(this, data);
        } else {
            console.error('Potatolytics is disabled but window.ga is absent!');
        }
    }

    function get_url() {
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
            logger.log('Initializing UA tracking through iframe');
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
                        logger.log('UA tracking iframe loaded');
                        potato_initialized = true;
                        ua_push(settings.ua_tracking_id, get_url(), clientID,
                            settings.tracking_site_section,
                            settings.tracking_site_section_index);
                        break;
                }
            });
        } else {
            logger.log('Initializing UA tracking without iframe');
            setupUATracking(settings.ua_tracking_id, get_url(), clientID,
                            settings.tracking_site_section, settings.tracking_site_section_index);
        }
    }

    logger.log('UA tracking initialized');

    z.win.on('navigating', function(e, popped) {
        // Otherwise we'll track back button hits etc.
        if (!popped) {
            var url = get_url();
            // Pass page vars to UA
            logger.log('UA-tracking page view', url);
            var uadata = _.extend({'page': url, 'title': document.title}, track_page_vars);
            ua_push('send', 'pageview', uadata);
            track_page_vars = {};
        }
    });

    function actionWrap(func) {
        if (!action_tracking_enabled) {
            return function() {};
        }
        return func;
    }

    return {
        enabled: true,
        action_enabled: action_tracking_enabled,
        track_log: track_log,
        track_page_vars: track_page_vars,
        track_vars: track_vars,
        setVar: actionWrap(function(index, value) {
            var dimension = 'dimension' + index;
            ua_push('set', dimension, value);
            track_log.push([dimension, value]);
            track_vars[dimension + index] = value;
        }),
        setPageVar: actionWrap(function(index, value) {
            var dimension = 'dimension' + index;
            track_log.push([dimension, value]);
            track_page_vars[dimension] = value;
        }),
        trackEvent: actionWrap(function() {
            var args = Array.prototype.slice.call(arguments, 0);
            ua_push.apply(this, ['send', 'event'].concat(args));
            track_log.push(args);
            return args;
        })
    };
});
