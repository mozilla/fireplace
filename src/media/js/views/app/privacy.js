define('views/app/privacy', ['l10n', 'urls'], function(l10n, urls) {

    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.start('detail/privacy.html', {slug: args[0]});

        builder.z('type', 'leaf');
        builder.z('parent', urls.reverse('app', [args[0]]));
        builder.z('title', gettext('Privacy Policy'));
    };
});
