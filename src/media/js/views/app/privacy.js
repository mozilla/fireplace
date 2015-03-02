define('views/app/privacy', ['core/l10n', 'core/urls'], function(l10n, urls) {
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf');
        builder.z('parent', urls.reverse('app', [args[0]]));
        builder.z('title', gettext('Privacy Policy'));

        builder.start('app/privacy.html', {slug: args[0]});
    };
});
