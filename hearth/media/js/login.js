define('login',
    ['capabilities', 'defer', 'jquery', 'log', 'notification', 'settings', 'underscore', 'urls', 'user', 'requests', 'z'],
    function(capabilities, defer, $, log, notification, settings, _, urls, user, requests, z) {

    var console = log('login');

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

    }).on('click', '.logout', function(e) {
        e.preventDefault();
        user.clear_token();
        z.body.removeClass('logged-in');
        z.page.trigger('reload_chrome').trigger('before_logout');

        if (!capabilities.phantom) {
            console.log('Triggering Persona logout');
            navigator.id.logout();
        }

        // Moved here from the onlogout callback for now until
        // https://github.com/mozilla/browserid/issues/3229
        // gets fixed.
        if (!z.context.dont_reload_on_login) {
            require('views').reload().done(function(){
                z.page.trigger('logged_out');
                signOutNotification();
            });
        } else {
            console.log('Reload on logout aborted by current view');
        }
    });

    var pending_logins = [];

    function startLogin() {
        var def = defer.Deferred();
        pending_logins.push(def);

        var opt = {
            termsOfService: settings.persona_tos,
            privacyPolicy: settings.persona_privacy,
            siteLogo: settings.persona_site_logo,
            oncancel: function() {
                console.log('Persona login cancelled');
                z.page.trigger('login_cancel');
                _.invoke(pending_logins, 'reject');
                pending_logins = [];
            }
        };
        if (settings.persona_unverified_issuer) {
            // We always need to force a specific issuer because bridged IdPs don't work with verified/unverified.
            // See bug 910938.
            opt.experimental_forceIssuer = settings.persona_unverified_issuer;
        }
        if (capabilities.mobileLogin) {
            // On mobile we don't require new accounts to verify their email.
            // On desktop, we do.
            opt.experimental_allowUnverified = true;
            console.log('Allowing unverified emails');
        } else {
            console.log('Not allowing unverified emails');
        }

        if (!capabilities.phantom) {
            console.log('Requesting login from Persona');
            navigator.id.request(opt);
        }
        return def.promise();
    }

    function gotVerifiedEmail(assertion) {
        console.log('Got assertion from Persona');

        var data = {
            assertion: assertion,
            audience: window.location.protocol + '//' + window.location.host,
            is_mobile: capabilities.mobileLogin
        };

        z.page.trigger('before_login');

        requests.post(urls.api.url('login'), data).done(function(data) {
            var should_reload = !user.logged_in();

            user.set_token(data.token, data.settings);
            user.update_permissions(data.permissions);
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

    var email = user.get_setting('email') || '';
    if (email) {
        console.log('Detected user', email);
    } else {
        console.log('No previous user detected');
    }

    if (!capabilities.phantom) {
        console.log('Calling navigator.id.watch');
        navigator.id.watch({
            loggedInUser: email,
            onlogin: gotVerifiedEmail,
            onlogout: function() {
                z.body.removeClass('logged-in');
                z.page.trigger('reload_chrome').trigger('logout');
            }
        });
    }

    return {login: startLogin};
});
