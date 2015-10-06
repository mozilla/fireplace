define('views/langpacks',
    ['core/l10n', 'core/log', 'core/models', 'core/urls', 'core/z'],
    function(l10n, log, models, urls, z) {
    'use strict';
    /*
       View showing the list of langpacks available for a specific version of
       Firefox OS. Only exposed through a WebActivity, not shown in the nav.

       See https://bugzil.la/1105530 and children.
    */

    var gettext = l10n.gettext;
    var logger = log('langpacks');

    function transform_to_app(langpack) {
        /* Make a langpack as returned by the API look like an app product to
           make it easy to re-use all buttons/install code. */
        langpack.isApp = true;
        langpack.is_packaged = true;
        langpack.premium_type = 'free';
        langpack.receipt_required = false;
        langpack.payment_required = false;
        langpack.role = 'langpack';
        langpack.slug = 'langpack-' + langpack.uuid;
        langpack.device_types = ['firefoxos'];
        return langpack;
    }

    return function(builder, args, params) {
        var title = gettext('Language Packs');
        var fxos_version = args[0];

        params.fxos_version = fxos_version;

        builder.z('type', 'leaf app-list langpacks');
        builder.z('title', title);

        builder.start('langpacks.html', {
            endpoint_name: 'langpacks',
            params: params,
            source: 'langpacks',
            subtitle: gettext('Firefox OS {version}', {version: fxos_version}),
            transform_to_app: transform_to_app,
            title: title
        });
    };
});
