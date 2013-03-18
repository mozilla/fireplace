define('views/abuse',
       ['l10n', 'requests', 'urls', 'z'],
       function(l10n, requests, urls, z) {
    'use strict';

    var gettext = l10n.gettext;

    // XXX: This handles **ALL** abuse form submission.
    z.page.on('submit', '.abuse-form', function(e) {
        e.preventDefault();
        // Submit report abuse form
        var $this = $(this);

        requests.post($this.data('action'), $this.serialize(), function(data) {
            console.log('submitted abuse report');
            $this.find('textarea').val('');
        });
    });

    return function(builder, args) {
        builder.start('detail/abuse.html', {slug: args[0]});

        builder.z('type', 'leaf');
        builder.z('title', gettext('Report Abuse'));
    };
});
