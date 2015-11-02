define('views/addon',
    ['core/capabilities', 'core/l10n', 'core/settings',
     'core/utils', 'truncator', 'utils_local'],
    function(caps, l10n, settings,
             utils, truncator, utilsLocal) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf detail spoke-header nav-addons');
        builder.z('title', gettext('Loading...'));

        truncator.init();

        var slug = decodeURIComponent(args[0]);
        builder.start('addon/index.html', {
            placeholder_addon: {
		            loading: true,
                name: gettext('Loading...'),
                slug: 'loading',
                version: gettext('Loading...'),
            },
            slug: slug
        });

        builder.onload('addon-data', function(addon) {
            // Called after addon defer block is finished loading.
            var name = utils.translate(addon.name);

            builder.z('title', name);
            utilsLocal.headerTitle(name);
            truncator.removeUntruncated();
        });
    };
});
