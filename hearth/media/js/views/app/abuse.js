define('views/app/abuse', ['l10n'], function(l10n) {

    var gettext = l10n.gettext;

    // Form submission handled in views/abuse.js

    return function(builder, args) {
        builder.start('detail/abuse.html', {slug: args[0]});

        builder.z('type', 'leaf');
        builder.z('title', gettext('Report Abuse'));
    };
});
