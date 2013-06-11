define('views/not_found', ['l10n'], function(l10n) {

    var gettext = l10n.gettext;

    return function(builder) {
        builder.start('not_found.html');

        builder.z('type', 'leaf');
        builder.z('title', gettext('Not Found'));  // L10n: Page not found (404)
    };
});
