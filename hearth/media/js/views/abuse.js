define('views/abuse',
       ['l10n', 'notification', 'requests', 'urls', 'z'],
       function(l10n, notification, requests, urls, z) {
    'use strict';

    var gettext = l10n.gettext;
    var notify = notification.notification;

    // XXX: This handles **ALL** abuse form submission.
    z.page.on('submit', '.abuse-form', function(e) {
        e.preventDefault();
        // Submit report abuse form
        var $this = $(this);

        requests.post($this.data('action'), $this.serialize()).done(function(data) {
            console.log('submitted abuse report');
            notify({message: gettext('Abuse reported')})
            $this.find('textarea').val('');
        }).fail(function() {
            notify({message: gettext('Error while submitting report')})
        });
    });

    return function(builder, args) {
        builder.start('detail/abuse.html', {slug: args[0]});

        builder.z('type', 'leaf');
        builder.z('title', gettext('Report Abuse'));
    };
});
