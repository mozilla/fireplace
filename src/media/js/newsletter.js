define('newsletter',
    ['capabilities', 'jquery', 'notification', 'requests', 'storage', 'urls', 'utils', 'z'],
    function(capabilities, $, notification, requests, storage, urls, utils, z) {
    'use strict';

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
        var data = utils.getVars($form.serialize());

        data.newsletter = 'marketplace-' + capabilities.device_platform();

        $form.addClass('processing-hidden');
        $processing.show();

        requests.post(urls.api.url('newsletter'), data).done(function() {
            $form.remove();
            $processing.remove();
            $success.show();
            storage.setItem('newsletter-completed', true);
            z.win.one('navigating', function() {
                $('#newsletter-footer').remove();
            });
        }).fail(function() {
            $processing.remove();
            $form.removeClass('processing-hidden');
            notification.notification({message: gettext('There was an error submitting your newsletter sign up request')});
        });
    }));
});
