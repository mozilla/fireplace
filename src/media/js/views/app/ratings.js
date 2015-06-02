define('views/app/ratings', ['core/l10n', 'core/urls'],
    function(l10n, urls) {
    var gettext = l10n.gettext;

    return function(builder, args) {
        var slug = args[0];
        builder.z('type', 'leaf');
        builder.z('parent', urls.reverse('app', [slug]));
        // L10n: The title for the list of reviews
        builder.z('title', gettext('Reviews'));
        builder.z('header-title', gettext('Read All Reviews'));

        builder.start('ratings/main.html', {
            'slug': slug
        });
    };
});
