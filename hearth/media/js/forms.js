define('forms', ['z'], function(z) {

    function checkValid(form) {
        if (form) {
            $(form).find('button[type=submit]').attr('disabled', !form.checkValidity());
        }
    }
    z.body.on('change keyup paste', 'input, select, textarea', function(e) {
        checkValid(e.target.form);
    }).on('loaded overlayloaded', function() {
        $('form').each(function() {
            checkValid(this);
        });
    });

    function toggleReviewFormState($formElm, enabled) {
        if (enabled) {
            $formElm.find('textarea, button').prop('disabled', false);
            $formElm.find('.ratingwidget').removeClass('disabled');
        } else {
            $formElm.find('textarea, button').prop('disabled', true);
            $formElm.find('.ratingwidget').addClass('disabled');
        }
    }

    return {toggleReviewFormState: toggleReviewFormState};

});
