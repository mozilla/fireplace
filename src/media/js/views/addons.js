define('views/addons',
    ['core/capabilities', 'core/l10n', 'core/settings', 'utils_local'],
    function(caps, l10n, settings, utils) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'root nav-addons');
        builder.z('title', gettext('Firefox OS Add-ons'));
        utils.headerTitle(gettext('Firefox OS Add-ons'));
        builder.start('addon/list.html');
    };
});
