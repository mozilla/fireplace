define('login',
    ['cache', 'capabilities', 'jquery', 'log', 'models', 'notification', 'settings', 'underscore', 'urls', 'user', 'requests', 'z', 'utils'],
    function(cache, capabilities, $, log, models, notification, settings, _, urls, user, requests, z) {

    var console = log('login');

    function flush_caches() {
        // We need to flush the global cache
        var cat_url = urls.api.url('categories');
        cache.purge(function(key) {return key != cat_url;});

        models('app').purge();
    }

    z.body.on('click', '.persona', function(e) {
        e.preventDefault();

        var $this = $(this);
        $this.addClass('loading-submit');
        startLogin().always(function() {
            $this.removeClass('loading-submit').blur();
        }).done(function() {
            notification.notification({message: gettext('You have been signed in')});
        });

    }).on('click', '.logout', function(e) {
        e.preventDefault();
        user.clear_token();
        z.body.removeClass('logged-in');
        z.page.trigger('reload_chrome');
        flush_caches();

        console.log('Triggering Persona logout');
        navigator.id.logout();

        notification.notification({message: gettext('You have been signed out')});
    });

    var pending_logins = [];

    function startLogin() {
        var def = $.Deferred();
        pending_logins.push(def);

        console.log('Requesting login from Persona');
        navigator.id.request({
            experimental_forceIssuer: settings.persona_unverified_issuer || null,
            experimental_allowUnverified: true,
            termsOfService: '/terms-of-use',
            privacyPolicy: '/privacy-policy',
            oncancel: function() {
                console.log('Persona login cancelled');
                _.invoke(pending_logins, 'reject');
                pending_logins = [];
            }
        });
        return def.promise();
    }

    function gotVerifiedEmail(assertion) {
        console.log('Got assertion from Persona');

        var data = {
            assertion: assertion,
            audience: window.location.protocol + '//' + window.location.host,
            is_native: navigator.id._shimmed ? 0 : 1
        };

        flush_caches();

        requests.post(urls.api.url('login'), data).done(function(data) {
            user.set_token(data.token, data.settings);
            user.update_permissions(data.permissions);
            console.log('Login succeeded, preparing the app');

            z.body.addClass('logged-in');
            $('.loading-submit').removeClass('loading-submit');
            z.page.trigger('reload_chrome');
            z.page.trigger('logged_in');

            function resolve_pending() {
                _.invoke(pending_logins, 'resolve');
                pending_logins = [];
            }

            if (z.context.reload_on_login) {
                console.log('Page requested reload on login');
                require('views').reload().done(resolve_pending);
            } else {
                console.log('Resolving outstanding login requests');
                resolve_pending();
            }

            var to = require('utils').getVars().to;
            if (to && to[0] == '/') {
                console.log('Navigating to post-login destination');
                z.page.trigger('navigate', [to]);
                return;
            }
        }).fail(function(jqXHR, textStatus, error) {
            console.warn('Assertion verification failed!', textStatus, error);

            var err = jqXHR.responseText;
            if (!err) {
                err = gettext("Persona login failed. Maybe you don't have an account under that email address?") + ' ' + textStatus + ' ' + error;
            }
            // Catch-all for XHR errors otherwise we'll trigger a notification
            // with its message as one of the error templates.
            if (jqXHR.status != 200) {
                err = gettext('Persona login failed. A server error was encountered.');
            }
            $('.loading-submit').removeClass('loading-submit');
            notification.notification({message: err});

            _.invoke(pending_logins, 'reject');
            pending_logins = [];
        });
    }

    function init_persona() {
        $('.persona').css('cursor', 'pointer');
        var email = user.get_setting('email') || '';
        if (email) {
            console.log('Detected user', email);
        } else {
            console.log('No previous user detected');
        }

        console.log('Calling navigator.id.watch');
        navigator.id.watch({
            loggedInUser: email,
            onlogin: gotVerifiedEmail,
            onlogout: function() {
                z.body.removeClass('logged-in');
                z.page.trigger('reload_chrome');
                z.win.trigger('logout');

                if (z.context.reload_on_logout) {
                    console.log('Page requested reload on logout');
                    require('views').reload();
                }
            }
        });
    }

    // Load `include.js` from persona.org, and drop login hotness like it's hot.
    var s = document.createElement('script');
    s.onload = init_persona;
    if (capabilities.firefoxOS) {
        // Load the Firefox OS include that knows how to handle native Persona.
        // Once this functionality lands in the normal include we can stop
        // doing this special case. See bug 821351.
        s.src = settings.native_persona;
    } else {
        s.src = settings.persona;
    }
    document.body.appendChild(s);
    $('.persona').css('cursor', 'wait');

    return {
        login: startLogin
    };
});
