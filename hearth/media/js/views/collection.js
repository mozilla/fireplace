define('views/collection',
       ['l10n', 'models', 'textoverflowclamp', 'utils', 'z'],
       function(l10n, models, clamper, utils, z) {
    'use strict';

    var gettext = l10n.gettext;
    var app_model = models('app');

    return function(builder, args) {
        var slug = args[0];
        builder.start('collection.html', {slug: slug}).done(function() {
            var collection = builder.results['collection'];
            if (collection) {
                builder.z('title', utils.translate(collection.name));
            }
        });

        builder.onload('collection', function(data) {
            if (!data.apps) {
                return;
            }
            clamper.clamp($('.collection + .desc'), 7);
            if (data['collection_type'] === 2) {
                builder.z('show_cats', true);
                builder.z('cat', data['slug']);
                z.page.trigger('build_start');
            }
            data.apps.map(app_model.cast);
        });

        builder.z('show_cats', false);
        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('Collection Details'));
    };
});
