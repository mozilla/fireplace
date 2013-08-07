define('views/collection', ['l10n'], function(l10n) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder, args) {
        var slug = args[0];
        builder.start('collection.html', {slug: slug}).done(function() {
            var collection = builder.results['collection'];
            if (collection) {
                builder.z('title', collection.name);
            }
        });

        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('Collection Details'));
    };
});
