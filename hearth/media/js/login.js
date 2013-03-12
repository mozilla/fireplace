define('login',
    ['capabilities', 'notification', 'settings', 'user', 'requests', 'z', 'utils', 'urls'],
    function(capabilities, notification, settings, user, requests, z) {

    z.body.on('promptlogin', function(e, skipDialog) {
        if (skipDialog) {
            startLogin();
        } else {
            $('#login').addClass('show');
        }

    }).on('click', '.persona', function(e) {
        var $this = $(this);
        $this.addClass('loading-submit');
        z.win.on('logincancel', function() {
            $this.removeClass('loading-submit').blur();
        })
        startLogin();
        e.preventDefault();

    }).on('click', '.logout', function() {
        if (navigator.id) {
            user.clear_token();
            navigator.id.logout();
        }
    });

    function startLogin() {
        navigator.id.request({
            forceIssuer: settings.persona_unverified_issuer || null,
            allowUnverified: true,
            termsOfService: '/terms-of-use',
            privacyPolicy: '/privacy-policy',
            oncancel: function() {
                z.win.trigger('logincancel');
            }
        });
    }

    function gotVerifiedEmail(assertion) {
        if (assertion) {
            var data = {
                assertion: assertion,
                is_native: navigator.id._shimmed ? 0 : 1
            };

            requests.post(require('urls').api.url('login'), data, function(data) {
                user.set_token(data.token, data.settings);
                console.log('finished login');
                z.body.addClass('logged-in');
                z.page.trigger('reload_chrome');

                var to = require('utils').getVars().to;
                if (to && to[0] == '/') {
                    z.page.trigger('navigate', [to]);
                    return;
                }
            }, function(jqXHR, textStatus, error) {
                var err = jqXHR.responseText;
                if (!err) {
                    err = gettext("Persona login failed. Maybe you don't have an account under that email address?") + " " + textStatus + " " + error;
                }
                // Catch-all for XHR errors otherwise we'll trigger 'notify'
                // with its message as one of the error templates.
                if (jqXHR.status != 200) {
                    err = gettext('Persona login failed. A server error was encountered.');
                }
                z.page.trigger('notify', {msg: err});
            });
        } else {
            $('.loading-submit').removeClass('loading-submit');
        }
    }

    function finishLogin() {
        z.page.trigger('reload_chrome');
        console.log('finished login');
        var to = utils.getVars().to;
        if (to && to[0] == '/') {
            z.page.trigger('navigate', [to]);
        }
    }

    function init_persona() {
        $('.persona').css('cursor', 'pointer');
        var email = user.get_setting('email') || '';
        console.log('detected user', email);
        navigator.id.watch({
            loggedInUser: email,
            onlogin: function(assertion) {
                gotVerifiedEmail(assertion);
            },
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
});
