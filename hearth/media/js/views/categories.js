/* Category index, listing of all categories. */

define('views/categories', [],
    function() {
    'use strict';

    return function(builder, args, params) {
        builder.z('type', 'root');
        builder.z('title', gettext('Categories'));

        builder.start('categories.html');
    };
});
