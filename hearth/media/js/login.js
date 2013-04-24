define('login',
    ['capabilities', 'jquery', 'notification', 'settings', 'underscore', 'user', 'requests', 'z', 'utils', 'urls', 'views'],
    function(capabilities, $, notification, settings, _, user, requests, z) {

    var _shimmed = false;

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
        postBack('navigator.id.logout', true);
        notification.notification({message: gettext('You have been signed out')});
    });

    var pending_logins = [];

    function startLogin() {
        var def = $.Deferred();
        pending_logins.push(def);

        postBack('navigator.id.request', {
            forceIssuer: settings.persona_unverified_issuer || null,
            allowUnverified: true,
            termsOfService: '/terms-of-use',
            privacyPolicy: '/privacy-policy'
        });
        return def.promise();
    }

    function gotVerifiedEmail(assertion) {
        if (assertion) {
            var data = {
                assertion: assertion,
                is_native: _shimmed ? 0 : 1
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

    window.addEventListener('message', function(e) {

        var key = e.data[0];
        var body = e.data[1];
        console.log('[potato] Got message from ' + e.origin, key, body);

        switch (key) {
            case 'navigator.id.request:cancel':
                _.invoke(pending_logins, 'reject');
                pending_logins = [];
                break;
            case 'navigator.id.watch:login':
                gotVerifiedEmail(body);
                break;
            case 'navigator.id.watch:logout':
                z.body.removeClass('logged-in');
                z.page.trigger('reload_chrome');
                z.win.trigger('logout');
                break;
            case '_shimmed':
                _shimmed = body;
                break;
        }

    }, false);

    var s = document.createElement('iframe');
    function postBack(key, value) {
        s.contentWindow.postMessage([key, value], '*');
    }

    s.onload = function() {
        $('.persona').css('cursor', 'pointer');
        var email = user.get_setting('email') || '';
        if (email) {
            console.log('detected user', email);
        }
        postBack('navigator.id.watch', email);
    };
    s.src = settings.login_provider + '/potato-login';
    s.style.display = 'none';
    document.body.appendChild(s);

    $('.persona').css('cursor', 'wait');

    return {login: startLogin};
});
