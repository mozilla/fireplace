define('views/app/privacy',
    ['core/l10n', 'core/requests', 'core/urls', 'utils_local'],
    function(l10n, requests, urls, utilsLocal) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        var slug = args[0];
        builder.z('type', 'leaf');
        builder.z('parent', urls.reverse('app', [slug]));

        requests.get(urls.api.url('app', [slug])).done(function(app) {
            var title = app.name;
            builder.z('title', title);
            utilsLocal.headerTitle(title);
        });

        builder.start('app/privacy.html', {slug: slug});
    };
});
