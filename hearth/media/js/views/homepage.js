define('views/homepage',
      ['capabilities', 'l10n', 'urls', 'utils', 'z'],
      function(capabilities, l10n, urls, utils, z) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder, args, params) {
        _.defaults(params || {}, {sort: 'popularity'});

        builder.z('title', '');  // We don't want a title on the homepage.

        builder.z('type', 'root');
        builder.z('search', params.name);
        builder.z('title', params.name);

        builder.start('category/main.html', {
            endpoint: urls.api.url('category', ['']),
            category_name: gettext('All Categories'),
            sort: params.sort
        }).done(setTrays);
    };
});
