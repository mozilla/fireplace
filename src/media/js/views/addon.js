define('views/addon',
    ['core/capabilities', 'core/l10n', 'core/settings',
     'core/utils', 'truncator', 'utils_local'],
    function(caps, l10n, settings,
             utils, truncator, utilsLocal) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf detail');
        builder.z('title', gettext('Loading...'));
        utilsLocal.headerTitle(gettext('Add-on Detail'));

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
            builder.z('title', utils.translate(addon.name));

            truncator.removeUntruncated();
        });
    };
});
