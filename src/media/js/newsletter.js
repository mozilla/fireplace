define('newsletter',
    ['core/capabilities', 'jquery', 'core/notification', 'core/nunjucks', 'core/requests', 'core/urls', 'core/user', 'user_helpers', 'core/utils', 'core/z'],
    function(capabilities, $, notification, nunjucks, requests, urls, user, user_helpers, utils, z) {
    'use strict';

    function context() {
        return {
            user_region: user_helpers.region('restofworld'),
            user_email: user.get_setting('email'),
            user_lang: utils.lang(),
        };
    }

    function renderFooter() {
        return nunjucks.env.render('newsletter.html', context());
    }

    function expandDetails($details) {
        if (!$details.hasClass('expanded')) {
            $details
                .addClass('expanding')
                .removeClass('collapsed')
                .one('transitionend', function() {
                    $details.addClass('expanded');
                });
            setTimeout(function() {
                $details.removeClass('expanding');
            }, 1);
        }
    }

    z.body.on('focus', '#newsletter-footer .email', function() {
        expandDetails($(this).siblings('.newsletter-details'));
    }).on('click', '.newsletter-signup-button', function() {
        expandDetails($(this).closest('form').find('.newsletter-details'));
    }).on('submit', '.newsletter form', utils._pd(function() {
        var $form = $(this);
        var $success = $form.siblings('.success');
        var $processing = $form.siblings('.processing');
        var $invalid = $form.find(':invalid');
        var data = utils.getVars($form.serialize());

        $form.addClass('submitted-once');
        if ($invalid.length) {
            $form.find('.error-message-wrapper').remove();
            $invalid.each(function(i, invalid) {
                $(invalid).before(
                    $('<div class="error-message-wrapper"/>').append(
                        $('<div class="error-message"/>').append(
                            $('<span/>').text(invalid.validationMessage))));
            });
            return;
        }

        data.newsletter = 'marketplace-' + capabilities.device_platform();

        $form.addClass('processing-hidden');
        $processing.show();

        requests.post(urls.api.url('newsletter'), data).done(function() {
            $form.remove();
            $processing.remove();
            $success.show();
            z.win.one('navigating', function() {
                // Once the success message is shown revert to the form after
                // the user navigates away so it can be resubmitted.
                $('#newsletter-footer').html(renderFooter());
            });
        }).fail(function() {
            $processing.remove();
            $form.removeClass('processing-hidden');
            notification.notification({message: gettext('There was an error submitting your newsletter sign up request')});
        });
    }));

    return {
        context: context,
    };
});
