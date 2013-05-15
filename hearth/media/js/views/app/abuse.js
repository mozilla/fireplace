define('views/app/abuse',
       ['forms', 'l10n', 'notification', 'requests', 'urls', 'z'],
       function(forms, l10n, notification, requests, urls, z) {

    var gettext = l10n.gettext;
    var notify = notification.notification;

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
        builder.start('detail/abuse.html', {slug: args[0]}).done(function() {
            $('.report-abuse').removeClass('modal');
        });

        builder.z('type', 'leaf');
        builder.z('parent', urls.reverse('app', [args[0]]));
        builder.z('title', gettext('Report Abuse'));
    };
});
