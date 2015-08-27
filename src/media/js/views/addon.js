define('views/addon',
    ['core/capabilities', 'core/l10n', 'core/settings', 'utils_local'],
    function(caps, l10n, settings, utils) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf detail');
        builder.z('title', gettext('Loading...'));
        utils.headerTitle(gettext('Add-on Detail'));

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
    };
});
