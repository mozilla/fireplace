define('views/app/privacy', ['core/l10n', 'core/urls'], function(l10n, urls) {
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf');
        builder.z('parent', urls.reverse('app', [args[0]]));
        var title = gettext('Privacy Policy');
        builder.z('title', title);
        builder.z('header-title', title);

        builder.start('app/privacy.html', {slug: args[0]});
    };
});
