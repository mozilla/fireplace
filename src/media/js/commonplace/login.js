define('login',
    ['cache', 'capabilities', 'consumer_info', 'defer', 'jquery', 'log', 'notification', 'settings', 'underscore', 'urls', 'user', 'utils', 'requests', 'z'],
    function(cache, capabilities, consumer_info, defer, $, log, notification, settings, _, urls, user, utils, requests, z) {

    var console = log('login');
    var persona_def = defer.Deferred();
    var persona_loaded = persona_def.promise();

    var fxa_popup;
    var pending_logins = [];

    function oncancel() {
        console.log('Login cancelled');
        z.page.trigger('login_cancel');
        _.invoke(pending_logins, 'reject');
        pending_logins = [];
    }

    function signOutNotification() {
        notification.notification({message: gettext('You have been signed out')});
    }

    function signInNotification() {
        notification.notification({message: gettext('You have been signed in')});
    }

    z.body.on('click', '.persona', function(e) {
        e.preventDefault();

        var $this = $(this);
        $this.addClass('loading-submit');
        startLogin().always(function() {
            $this.removeClass('loading-submit').trigger('blur');
        });

    }).on('click', '.logout', utils._pd(function(e) {
        requests.del(urls.api.url('logout'));

        cache.flush_signed();
        user.clear_token();

        if (capabilities.persona()) {
            console.log('Triggering Persona logout');
            navigator.id.logout();
        }

        z.body.removeClass('logged-in');
        z.page.trigger('reload_chrome').trigger('before_logout');
        // Moved here from the onlogout callback for now until
        // https://github.com/mozilla/browserid/issues/3229
        // gets fixed.
        if (!z.context.dont_reload_on_login) {
            z.page.trigger('logged_out');
            signOutNotification();
            require('views').reload();
        } else {
            console.log('Reload on logout aborted by current view');
        }
    }));

    function getCenteredCoordinates(width, height) {
        var x = window.screenX + Math.max(0, Math.floor((window.innerWidth - width) / 2));
        var y = window.screenY + Math.max(0, Math.floor((window.innerHeight - height) / 2));
        return [x, y];
    }

    function startLogin() {
        var w = 320;
        var h = 500;
        var i = getCenteredCoordinates(w, h);
        var def = defer.Deferred();
        pending_logins.push(def);

        var opt = {
            termsOfService: settings.persona_tos,
            privacyPolicy: settings.persona_privacy,
            siteLogo: settings.persona_site_logo,
            oncancel: oncancel
        };
        if (settings.persona_unverified_issuer) {
            // We always need to force a specific issuer because bridged IdPs don't work with verified/unverified.
            // See bug 910938.
            opt.experimental_forceIssuer = settings.persona_unverified_issuer;
        }
        if (capabilities.mobileLogin()) {
            // On mobile we don't require new accounts to verify their email.
            // On desktop, we do.
            opt.experimental_allowUnverified = true;
            console.log('Allowing unverified emails');
        } else {
            console.log('Not allowing unverified emails');
        }
        if (capabilities.fallbackFxA()) {
            window.addEventListener('message', function (msg) {
                if (!msg.data || !msg.data.auth_code) {
                    return;
                }
                var data = {
                    'auth_response': msg.data.auth_code,
                    'state': settings.fxa_auth_state
                };
                z.page.trigger('before_login');
                requests.post(urls.api.url('fxa-login'), data).done(function(data) {
                    user.set_token(data.token, data.settings);
                    user.update_permissions(data.permissions);
                    user.update_apps(data.apps);
                    console.log('Login succeeded, preparing the app');
                    z.body.addClass('logged-in');
                    $('.loading-submit').removeClass('loading-submit');
                    z.page.trigger('reload_chrome').trigger('logged_in');
                    _.invoke(pending_logins, 'resolve');
                    pending_logins = [];
                });
            }, false);

            fxa_popup = window.open(settings.fxa_auth_url, 'fxa',
                'width=' + w + ',height=' + h + ',left=' + i[0] + ',top=' + i[1]);

            // The same-origin policy prevents us from listening to events to
            // know when the cross-origin FxA popup was closed. And we can't
            // listen to `focus` on the main window because, unlike Chrome,
            // Firefox does not fire `focus` when a popup is closed (presumably
            // because the page never truly lost focus).
            var popup_interval = setInterval(function() {
                if (!fxa_popup || fxa_popup.closed) {
                    oncancel();
                    clearInterval(popup_interval);
                }
            }, 150);

        } else {
            persona_loaded.done(function() {
                if (capabilities.persona()) {
                    console.log('Requesting login from Persona');
                    if (capabilities.nativeFxA()) {
                        navigator.id.request({oncancel: opt.oncancel});
                    } else {
                        navigator.id.request(opt);
                    }
                }
            });
        }
        return def.promise();
    }

    function gotVerifiedEmail(assertion) {
        console.log('Got assertion from Persona');

        var data = {
            assertion: assertion,
            audience: window.location.protocol + '//' + window.location.host,
            is_mobile: capabilities.mobileLogin()
        };

        z.page.trigger('before_login');

        requests.post(urls.api.url('login'), data).done(function(data) {
            var should_reload = !user.logged_in();

            user.set_token(data.token, data.settings);
            user.update_permissions(data.permissions);
            user.update_apps(data.apps);
            console.log('Login succeeded, preparing the app');

            z.body.addClass('logged-in');
            $('.loading-submit').removeClass('loading-submit');
            z.page.trigger('reload_chrome').trigger('logged_in');

            function resolve_pending() {
                _.invoke(pending_logins, 'resolve');
                pending_logins = [];
            }

            if (should_reload && !z.context.dont_reload_on_login) {
                require('views').reload().done(function() {
                    resolve_pending();
                    signInNotification();
                });
            } else {
                console.log('Reload on login aborted by current view');
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

            z.page.trigger('login_fail');
            _.invoke(pending_logins, 'reject');
            pending_logins = [];
        });
    }

    function loadPersona() {
        var persona_loading_start = +(new Date());
        var persona_loading_time = 0;
        var persona_step = 25;  // 25 milliseconds

        // If we don't have navigator.id/mozId and the shim script is absent,
        // we need to inject it.
        if (!capabilities.persona() &&
            !$('script[src="' + settings.persona_shim_url + '"]').length) {
            var s = document.createElement('script');
            s.async = true;
            s.src = settings.persona_shim_url;
            document.body.appendChild(s);
        }

        // Check for navigator.id/mozId every persona_step milliseconds to
        // resolve (or reject if we waited too long) the promise.
        var persona_interval = setInterval(function() {
            persona_loading_time = +(new Date()) - persona_loading_start;
            if (capabilities.persona()) {
                console.log('Persona loaded (' + persona_loading_time / 1000 + 's)');
                persona_def.resolve();
                clearInterval(persona_interval);
            } else if (persona_loading_time >= settings.persona_timeout) {
                console.error('Persona timeout (' + persona_loading_time / 1000 + 's)');
                persona_def.reject();
                clearInterval(persona_interval);
            }
        }, persona_step);

        persona_loaded.done(function() {
            // This lets us change the cursor for the "Sign in" link.
            z.body.addClass('persona-loaded');
            var opts;
            var email = user.get_setting('email') || '';
            if (email) {
                console.log('Detected user', email);
            } else {
                console.log('No previous user detected');
            }

            if (capabilities.persona()) {
                console.log('Calling navigator.id.watch');
                opts = {
                    loggedInUser: email,
                    onready: function() {},
                    onlogin: gotVerifiedEmail,
                    onlogout: function() {
                        z.body.removeClass('logged-in');
                        z.page.trigger('reload_chrome').trigger('logout');
                    }
                };
                if (capabilities.nativeFxA()) {
                    opts.wantIssuer = 'firefox-accounts';
                }
                navigator.id.watch(opts);
            }
        }).fail(function() {
            notification.notification({
                message: gettext('Persona cannot be reached. Try again later.')
            });
        });

        return persona_loaded;
    }

    consumer_info.promise.done(function() {
        // Wait on consumer_info promise, because it tells us whether fxa is
        // enabled. (FIXME bug 1038936).
        if (!capabilities.fallbackFxA()) {
            window.console.info('Ok, no fallback FxA, loading Persona...');
            // Try to load persona. This is used by persona native/fallback
            // implementation, as well as fxa native.
            loadPersona();
        } else {
            // Handle fallback FxA. It doesn't use navigator.id, so we don't
            // have anything to inject and can immediately add the
            // "persona-loaded" class instead of waiting on the promise.
            // This lets us change the cursor for the "Sign in" link.
            persona_def.reject();
            z.body.addClass('persona-loaded');
        }
    });

    return {login: startLogin};
});
