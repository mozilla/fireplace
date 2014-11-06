define('views/fxa_popup',
       ['defer', 'format', 'l10n', 'login', 'requests', 'settings', 'urls', 'user', 'utils', 'z'],
       function(defer, format, l10n, login, requests, settings, urls, user, utils, z) {

    function replaceCSS(builder, cssPath) {
        // Prepare for CSS ruining.
        var stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

        // Add Firefox Accounts's CSS because we want to be just like them.
        var newStylesheet = document.createElement('link');
        newStylesheet.rel = 'stylesheet';
        newStylesheet.href = cssPath;
        newStylesheet.addEventListener('load', function(e) {
            // Remove the old stylesheets so we don't get weird styling.
            Array.prototype.forEach.call(stylesheets, function(stylesheet) {
                stylesheet.parentNode.removeChild(stylesheet);
            });
            // Change the page type to hide the splash.
            builder.z('type', 'standalone');
        });
        document.head.appendChild(newStylesheet);
    }

    return function(builder, args, params) {
        var cssPath = utils.urlparams(urls.media(settings.fxa_css_path),
                                      {b: z.body.data('build-id-js')});

        // Ensure the splash screen stays up.
        z.body.attr('data-page-type', 'standalone-loading');

        builder.start('fx_accounts_popup.html', {
            title: l10n.gettext('Firefox Accounts'),
        });

        replaceCSS(builder, cssPath);

        var viewParent = document.getElementById('main-content');

        var noticeForm = document.getElementById('notice-form');
        var continueButton = noticeForm['continue-button'];

        var email;
        var emailForm = document.getElementById('email-form');
        var emailField = emailForm.email;
        var emailButton = document.getElementById('email-button');
        var emailError = document.getElementById('email-error');
        emailError.parentNode.removeChild(emailError);

        noticeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (user.logged_in()) {
                requests.post(urls.api.url('preverify_token'))
                        .then(signUp, signUp);
            } else {
                sendVerificationEmail()
                    .then(function(confirmation) {
                        showEmailSentPage(confirmation);
                    }, function(response) {
                        redirectToFxA(action);
                        console.error("Failed to send email confirmation",
                                      response);
                    });
            }
        });

        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (emailField.validity.valid) {
                setEmail(emailField.value);
            } else {
                emailField.parentNode.appendChild(emailError);
            }
        });

        emailField.addEventListener('input', function(e) {
            if (emailField.validity.valid) {
                emailButton.classList.remove('disabled');
            } else {
                emailButton.classList.add('disabled');
            }
        });

        viewParent.addEventListener('click', function(e) {
            if (e.target.classList.contains('back')) {
                e.preventDefault();
                showEmailForm();
            }
        });

        if (user.logged_in()) {
            // Use the currently logged in user's email.
            setEmail(user.get_setting('email'));
        }

        function redirectToFxA(action, preVerifyToken) {
            var url = login.get_fxa_auth_url() +
                '&email=' + encodeURIComponent(email) +
                '&action=' + encodeURIComponent(action);
            if (preVerifyToken) {
                url += '&preVerifyToken=' + encodeURIComponent(preVerifyToken);
            }
            window.location = url;
        }

        function getAccountInfo() {
            return requests.get(urls.api.unsigned.url('account_info', email));
        }

        function sendVerificationEmail() {
            return requests.put(
                urls.api.unsigned.url('preverify_confirmation', email));
        }

        function showEmailSentPage(confirmation) {
            var text = gettext(
                'Click the verification link sent to {email} to transfer ' +
                'your apps to Firefox Accounts.');
            text = format.format(text, {email: email});
            document.getElementById('verification-text').textContent = text;
            showBox('email-sent');
        }

        function showEmailForm() {
            showBox('email');
            emailField.focus();
        }

        function showBox(name) {
            viewParent.setAttribute('data-view-state', name);
        }

        function signIn() {
            redirectToFxA('signin');
        }

        function signUp(token) {
            redirectToFxA('signup', token);
        }

        function notifyOfMigration() {
            showBox('info');
        }

        function setEmail(_email) {
            if (_email) {
                email = _email;
                getAccountInfo().then(function(info) {
                    var outcomes = {
                        'firefox-accounts': signIn,
                        'unknown': signUp,
                        'persona': notifyOfMigration,
                    };
                    var nextStep = outcomes[info.source] || signUp;
                    nextStep();
                }, signUp);
            }
        }
    };
});
