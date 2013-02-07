// JS for the desktop Feedback overlay.

define(['browser', 'capabilities', 'utils', 'z'], function(browser, capabilities, utils, z) {
    function validate(form) {
        // The feedback box shouldn't be empty.
        return !!form.find('textarea').val();
    }

    function reset(form) {
        // Remove errors and empty values.
        form.find('.notification-box').remove();
        form.find('.error').removeClass('error');
        $('.feedback-form').find('textarea').val('');
    }

    function processFeedback(e) {
        var $form = $(this);

        if (!validate($form)) {
            if ($form.find('div.error').length === 0) {
                $form.prepend($('<div>', {
                    'text': gettext('Message must not be empty.'),
                    'class': 'notification-box error c'
                }));
            }
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        var platformInput = $form.find('input[name="platform"]');
        if (capabilities.gaia) {
            platformInput.val('Gaia');
        } else if (browser.os.android) {
            platformInput.val('Firefox for Android');
        } else if (capabilities.mobile) {
            platformInput.val('Mobile');
        } else if (capabilities.desktop) {
            platformInput.val('Desktop');
        }
        $form.find('input[name="chromeless"]').val(capabilities.chromeless ? 'Yes' : 'No');
        $form.find('input[name="from_url"]').val(window.location.pathname);

        overlay.removeClass('show');
    }


    function init() {
        var overlay = $('#feedback-overlay');

        // Bind up them events.
        var overlayForm = overlay.find('form')

        // Don't go to /account/feedback, show the overlay.
        $('.submit-feedback').on('click', utils._pd(function(e) {
            e.stopPropagation();
            overlay.addClass('show');
        }));

        overlayForm.on('submit', processFeedback);
        z.page.on('loaded', function() {
            reset(overlayForm);
            z.page.find('.feedback-form').on('submit', processFeedback);
        });
    }

    return {init: init};
});
