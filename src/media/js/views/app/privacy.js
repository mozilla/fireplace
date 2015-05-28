define('views/app/privacy',
    ['core/l10n', 'core/urls', 'utils_local'],
    function(l10n, urls, utilsLocal) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf');
        builder.z('parent', urls.reverse('app', [args[0]]));
        var title = gettext('Privacy Policy');
        builder.z('title', title);
        utilsLocal.headerTitle(title);

        builder.start('app/privacy.html', {slug: args[0]});
    };
});
