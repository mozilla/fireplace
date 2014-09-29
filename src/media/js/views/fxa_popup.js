define('views/fxa_popup',
       ['defer', 'jquery', 'l10n', 'login', 'requests', 'settings', 'urls', 'user', 'z'],
       function (defer, $, l10n, login, requests, settings, urls, user, z) {

    return function (builder, args, params) {
        var cssPath = urls.media(settings.fxa_css_path);

        z.body.css({display: 'none'});
        // TODO: Keep showing the splash until the new CSS is loaded.
        // Unhide the body when this JS context is done.
        setTimeout(function () {
            z.body.css({display: 'block'});
        }, 1);

        z.body.attr('data-page-type', 'standalone-loading');
        // Remove the stuff we don't want.
        $('#site-header, #site-footer, #site-nav, #lightbox, mkt-banner').remove();

        // Prepare for CSS ruining.
        // Select all the current stylesheets, we'll remove them later.
        var stylesheets = $('link[rel="stylesheet"]');

        // Add Firefox Accounts's CSS because we want to be just like them.
        $('head').append('<link rel="stylesheet" href="' + cssPath + '">');

        // Remove Marketplace's CSS because we want to start fresh.
        stylesheets.remove();

        builder.start('fx_accounts_popup.html', {
            title: l10n.gettext('Firefox Accounts'),
        });
        builder.z('type', 'standalone');

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
