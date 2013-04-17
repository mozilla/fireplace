define('login',
    ['capabilities', 'jquery', 'notification', 'settings', 'underscore', 'user', 'requests', 'z', 'utils', 'urls', 'views'],
    function(capabilities, $, notification, settings, _, user, requests, z) {

    z.body.on('click', '.persona', function(e) {
        e.preventDefault();

        var $this = $(this);
        $this.addClass('loading-submit');
        startLogin().then(function() {
            $this.removeClass('loading-submit').blur();
        });

    }).on('click', '.logout', function(e) {
        if (navigator.id) {
            e.preventDefault();
            user.clear_token();
            navigator.id.logout();
        }
    });

    var pending_logins = [];

    function startLogin() {
        var def = $.Deferred();
        pending_logins.push(def);

        navigator.id.request({
            forceIssuer: settings.persona_unverified_issuer || null,
            allowUnverified: true,
            termsOfService: '/terms-of-use',
            privacyPolicy: '/privacy-policy',
            oncancel: function() {
                _.invoke(pending_logins, 'reject');
                pending_logins = [];
            }
        });
        return def.promise();
    }

    function gotVerifiedEmail(assertion) {
        if (assertion) {
            var data = {
                assertion: assertion,
                audience: window.location.protocol + '//' + window.location.host,
                is_native: navigator.id._shimmed ? 0 : 1
            };

            requests.post(require('urls').api.url('login'), data).done(function(data) {
                user.set_token(data.token, data.settings);
                console.log('finished login');
                z.body.addClass('logged-in');
                $('.loading-submit').removeClass('loading-submit persona');
                z.page.trigger('reload_chrome');
                z.page.trigger('logged_in');

                function resolve_pending() {
                    _.invoke(pending_logins, 'resolve');
                    pending_logins = [];
                }

                if (z.context.reload_on_login) {
                    require('views').reload().done(resolve_pending);
                } else {
                    resolve_pending();
                }


                var to = require('utils').getVars().to;
                if (to && to[0] == '/') {
                    z.page.trigger('navigate', [to]);
                    return;
                }
            }).fail(function(jqXHR, textStatus, error) {
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
        } else {
            $('.loading-submit').removeClass('loading-submit');
        }
    }

    function init_persona() {
        $('.persona').css('cursor', 'pointer');
        var email = user.get_setting('email') || '';
        if (email) {
            console.log('detected user', email);
        }
        navigator.id.watch({
            loggedInUser: email,
            onlogin: gotVerifiedEmail,
            onlogout: function() {
                z.body.removeClass('logged-in');
                z.page.trigger('reload_chrome');
                z.win.trigger('logout');
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
