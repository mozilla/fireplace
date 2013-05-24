define('views/feedback',
       ['buckets', 'capabilities', 'forms', 'helpers', 'l10n', 'notification', 'requests', 'templates', 'urls', 'utils', 'z'],
       function(buckets, caps, forms, helpers, l10n, notification, requests, nunjucks, urls, utils, z) {

    var gettext = l10n.gettext;
    var notify = notification.notification;

    z.page.on('submit', '.feedback-form', function(e) {
        e.preventDefault();

        var $this = $(this);
        var data = utils.getVars($this.serialize());
        data.chromeless = caps.chromeless ? 'Yes' : 'No';
        data.from_url = window.location.pathname;
        data.profile = buckets.get_profile();

        forms.toggleSubmitFormState($this);

        requests.post(urls.api.url('feedback'), data).done(function(data) {
            $this.find('textarea').val('');
            forms.toggleSubmitFormState($this, true);
            $('.cloak').trigger('dismiss');
            notify({message: gettext('Feedback submitted. Thanks!')});
        }).fail(function() {
            forms.toggleSubmitFormState($this, true);
            notify({
                message: gettext('There was a problem submitting your feedback. Try again soon.')
            });
        });
    });

    // Init desktop feedback form modal trigger.
    function addFeedbackModal() {
        if (!caps.widescreen()) return;
        if (!$('.main.feedback:not(.modal)').length && !$('.feedback.modal').length) {
            z.page.append(
                nunjucks.env.getTemplate('settings/feedback.html').render(helpers)
            );
        }
        z.body.trigger('decloak');
    }

    z.body.on('click', '.submit-feedback', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // Focus the form if we're on the feedback page.
        if ($('.main.feedback:not(.modal)').length) {
            $('.simple-field textarea').focus();
            return;
        }
        addFeedbackModal();
        $('.feedback.modal').addClass('show');
    });

    return function(builder) {
        builder.start('settings/feedback.html').done(function() {
            $('.feedback').removeClass('modal');
            addFeedbackModal();
        });

        builder.z('type', 'root');
        builder.z('title', gettext('Feedback'));
    };
});
