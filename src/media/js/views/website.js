define('views/website',
    ['core/utils', 'truncator'],
    function(utils, truncator) {
    'use strict';

    return function(builder, args) {
        truncator.init();

        builder.z('type', 'leaf detail website');
        builder.z('title', gettext('Loading...'));
        builder.z('header-title', gettext('Website Detail'));

        var pk = args[0];
        builder.start('website/index.html', {
            placeholder_website: {
                title: gettext('Loading...'),
                short_title: gettext('Loading...'),
                description: gettext('Loading...'),
            },
            pk: pk
        });

        builder.onload('website-data', function(website) {
            truncator.removeUntruncated();
            builder.z('title', utils.translate(website.name));
        });
    };
});
