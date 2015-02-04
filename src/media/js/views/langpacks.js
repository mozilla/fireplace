define('views/langpacks',
    ['l10n', 'log', 'models', 'urls', 'z'],
    function(l10n, log, models, urls, z) {
    'use strict';
    /*
       View showing the list of langpacks available for a specific version of
       Firefox OS. Only exposed through a WebActivity, not shown in the nav.

       See https://bugzil.la/1105530 and children.
    */

    var gettext = l10n.gettext;
    var logger = log('langpacks');

    return function(builder, args, params) {
        var title = gettext('Language Packs');
        var fxos_version = args[0];

        params.fxos_version = fxos_version;

        builder.z('type', 'root app-list langpacks');
        builder.z('title', title);

        builder.start('langpacks.html', {
            endpoint_name: 'langpacks',
            params: params,
            source: 'langpacks',
            subtitle: gettext('Firefox OS {version}', {version: fxos_version}),
            title: title
        });
    };
});
