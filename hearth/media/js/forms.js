define('forms', ['z'], function(z) {

    function checkValid(form) {
        if (form) {
            $(form).filter(':not([novalidate])').find('button[type=submit]').attr('disabled', !form.checkValidity());
        }
    }
    z.body.on('change keyup paste', 'input, select, textarea', function(e) {
        checkValid(e.target.form);
    }).on('loaded decloak', function() {
        $('form:not([novalidate])').each(function() {
            checkValid(this);
        });
        $('form[novalidate] button[type=submit]').removeAttr('disabled');
    });

    // Use this if you want to disable form inputs while the post/put happens.
    function toggleSubmitFormState($formElm, enabled) {
        $formElm.find('textarea, button, input').prop('disabled', !enabled);
        $formElm.find('.ratingwidget').toggleClass('disabled', !enabled);
        if (enabled) {
            checkValid($formElm[0]);
        }
    }

    return {toggleSubmitFormState: toggleSubmitFormState};

});
