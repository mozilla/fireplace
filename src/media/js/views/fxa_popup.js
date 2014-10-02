define('views/fxa_popup',
       ['defer', 'l10n', 'login', 'requests', 'settings', 'urls', 'user', 'z'],
       function (defer, l10n, login, requests, settings, urls, user, z) {

    function replaceCSS(builder, cssPath) {
        // Prepare for CSS ruining.
        var stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

        // Add Firefox Accounts's CSS because we want to be just like them.
        var newStylesheet = document.createElement('link');
        newStylesheet.rel = 'stylesheet';
        newStylesheet.href = cssPath;
        newStylesheet.addEventListener('load', function (e) {
            // Remove the old stylesheets so we don't get weird styling.
            Array.prototype.forEach.call(stylesheets, function (stylesheet) {
                stylesheet.parentNode.removeChild(stylesheet);
            });
            // Change the page type to hide the splash.
            builder.z('type', 'standalone');
        });
        document.head.appendChild(newStylesheet);
    }

    return function (builder, args, params) {
        var cssPath = urls.media(settings.fxa_css_path);

        // Ensure the splash screen stays up.
        z.body.attr('data-page-type', 'standalone-loading');

        builder.start('fx_accounts_popup.html', {
            title: l10n.gettext('Firefox Accounts'),
        });

        replaceCSS(builder, cssPath);

        var noticeForm = document.getElementById('notice-form');
        var continueButton = noticeForm['continue-button'];

        var emailForm = document.getElementById('email-form');
        var emailField = emailForm.email;
        var emailButton = document.getElementById('email-button');
        var emailError = document.getElementById('email-error');
        emailError.parentNode.removeChild(emailError);

        noticeForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var email = user.get_setting('email');
            if (email) {
                redirectToFxA(email);
            } else {
                document.body.classList.add('email');
                emailField.focus();
            }
        });

        emailForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (emailField.validity.valid) {
                redirectToFxA(emailField.value);
            } else {
                emailField.parentNode.appendChild(emailError);
            }
        });

        emailField.addEventListener('keydown', function (e) {
            if (emailField.validity.valid) {
                emailButton.classList.remove('disabled');
            } else {
                emailButton.classList.add('disabled');
            }
        });

        function redirectToFxA(email) {
            requests.get(urls.api.unsigned.url('account_info', email))
                    .then(function (info) {
                var action = info.source === 'firefox-accounts' ? 'signin'
                                                                : 'signup';
                window.location = login.get_fxa_auth_url() +
                    '&email=' + encodeURIComponent(email) +
                    '&action=' + action;
            });
        }

    };
});
