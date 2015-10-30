define('views/app/ratings',
    ['core/l10n', 'core/urls', 'utils_local'],
    function(l10n, urls, utilsLocal) {
    var gettext = l10n.gettext;

    return function(builder, args) {
        var slug = decodeURIComponent(args[0]);
        builder.z('type', 'leaf reviews spoke-header nav-apps');
        builder.z('parent', urls.reverse('app', [slug]));
        // L10n: The title for the list of reviews
        builder.z('title', gettext('Reviews'));
        utilsLocal.headerTitle(gettext('Read All Reviews'));

        builder.start('ratings/main.html', {
            'slug': slug
        });
    };
});
