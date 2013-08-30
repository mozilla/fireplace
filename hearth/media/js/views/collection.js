define('views/collection', ['l10n', 'models'], function(l10n, models) {
    'use strict';

    var gettext = l10n.gettext;
    var app_model = models('app');

    return function(builder, args) {
        var slug = args[0];
        builder.start('collection.html', {slug: slug}).done(function() {
            var collection = builder.results['collection'];
            if (collection) {
                builder.z('title', collection.name);
            }
        });

        builder.onload('collection', function(data) {
            if (!data.apps) {
                return;
            }
            data.apps.map(app_model.cast);
        });

        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('Collection Details'));
    };
});
