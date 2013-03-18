define('views/app/privacy', ['l10n'], function(l10n) {

    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.start('detail/privacy.html', {slug: args[0]});

        builder.z('type', 'leaf');
        builder.z('title', gettext('Privacy Policy'));
    };
});
