define('views/addon/abuse',
    ['core/forms', 'core/l10n', 'core/notification', 'core/requests',
     'core/urls', 'core/utils', 'core/z', 'utils_local'],
    function(forms, l10n, notification, requests, urls, utils, z, utilsLocal) {
    var gettext = l10n.gettext;
    var notify = notification.notification;

    z.doc.on('submit', '.abuse-form', utils._pd(function(e) {
        var $this = $(this);
        var slug = $this.find('input[name=extension]').val();
        var data = utils.getVars($this.serialize());

        forms.toggleSubmitFormState($this);

        requests.post(urls.api.url('addon_abuse'), data).done(function(data) {
            notify({message: gettext('Report submitted. Thanks!')});
            z.page.trigger('navigate', urls.reverse('addon', [slug]));
        }).fail(function() {
            forms.toggleSubmitFormState($this, true);
            notify({message: gettext('There was an issue submitting your report. Please try again later.')});
        });
    }));

    z.body.on('click', '.addon-report-abuse .button', function(e) {
        var slug = $(this).closest('.addon-detail').data('slug');
        z.page.trigger('navigate', [urls.reverse('addon/abuse', [slug])]);
    });

    return function(builder, args) {
        builder.z('type', 'leaf');
        builder.z('parent', urls.reverse('addon', [args[0]]));
        // L10n: Report abuse regarding an add-on.
        var title = gettext('Report to Mozilla');
        builder.z('title', title);
        utilsLocal.headerTitle(title);

        builder.start('addon/abuse.html', {
            slug: args[0]
        });
    };
});
