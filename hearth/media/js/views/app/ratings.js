define('views/app/ratings', ['l10n'], function(l10n) {

    var gettext = l10n.gettext;

    return function(builder, args) {
        var slug = args[0];
        builder.start('ratings/main.html', {
            'slug': slug
        });

        builder.z('type', 'leaf');
        builder.z('reload_on_login', true);
        builder.z('title', gettext('Reviews'));
    };
});
