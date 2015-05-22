define('views/website/issue',
    ['core/forms', 'core/l10n', 'core/notification', 'core/requests',
     'core/urls', 'core/utils', 'core/z'],
    function(forms, l10n, notification, requests,
             urls, utils, z) {
    var gettext = l10n.gettext;
    var notify = notification.notification;

    z.page.on('submit', '.issue-form', function(e) {
        e.preventDefault();
        var $this = $(this);
        var formData = utils.getVars($this.serialize());

        forms.toggleSubmitFormState($this);

        requests.post(urls.api.url('website_issue'), formData).done(function(data) {
            notify({message: gettext('Report submitted. Thanks!')});
            z.page.trigger('navigate',
                           urls.reverse('website', [formData.website]));
        }).fail(function() {
            forms.toggleSubmitFormState($this, true);
            notify({message: gettext('There was an issue submitting your report. Please try again later.')});
        });
    });

    return function(builder, args) {
        builder.z('type', 'leaf');
        builder.z('parent', urls.reverse('website', [args[0]]));
        builder.z('title', gettext('Report an Issue'));

        builder.start('website/issue.html', {
            pk: args[0]
        });
    };
});
