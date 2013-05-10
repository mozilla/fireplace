define('views/abuse',
       ['forms', 'l10n', 'notification', 'requests', 'urls', 'z'],
       function(forms, l10n, notification, requests, urls, z) {
    'use strict';

    var gettext = l10n.gettext;
    var notify = notification.notification;

    // XXX: This handles **ALL** abuse form submission.
    z.page.on('submit', '.abuse-form', function(e) {
        e.preventDefault();
        // Submit report abuse form
        var $this = $(this);
        var slug = $this.find('input[name=app]').val();
        var data = $this.serialize();

        forms.toggleSubmitFormState($this);

        requests.post(urls.api.url('app_abuse'), data).done(function(data) {
            notify({message: gettext('Abuse reported')});
            z.page.trigger('navigate', urls.reverse('app', [slug]));
        }).fail(function() {
            forms.toggleSubmitFormState($this, true);
            notify({message: gettext('Error while submitting report')});
        });
    });

    return function(builder, args) {
        builder.start('detail/abuse.html', {slug: args[0]});

        builder.z('type', 'leaf');
        builder.z('title', gettext('Report Abuse'));
    };
});
